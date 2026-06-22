import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { WebView } from 'react-native-webview';
import { colors } from '../theme';

const BOGOTA = { latitude: 4.7109, longitude: -74.0721 };

/**
 * Mapa basado en Leaflet + OpenStreetMap (tiles oscuros de CARTO).
 * No requiere API key de Google → gratis y sin crashear en Android.
 *
 * Como el backend NO guarda coordenadas, geocodificamos la dirección
 * (address + city) con Nominatim (OpenStreetMap) dentro del WebView,
 * igual que hace la versión web. Se cachea en localStorage.
 *
 * Props:
 *   locals: [{ id, name, address, city, avg_rating }]
 *   userLocation: { latitude, longitude } | null
 *   onSelectLocal: (id) => void   // al tocar "Ver detalles" de un marcador
 *
 * Ref: { centerOnUser() }
 */
const MapWebView = forwardRef(function MapWebView({ locals = [], userLocation, onSelectLocal }, ref) {
  const webRef = useRef(null);
  const readyRef = useRef(false);

  const center = userLocation || BOGOTA;

  useImperativeHandle(ref, () => ({
    centerOnUser: () => {
      const u = userLocation || BOGOTA;
      webRef.current?.injectJavaScript(
        `window.__centerOn(${u.latitude}, ${u.longitude}); true;`
      );
    },
  }));

  // Empuja los locales al WebView (que los geocodifica) cuando cambian
  function pushMarkers() {
    if (!readyRef.current || !webRef.current) return;
    const data = locals
      .filter((l) => l.address || l.city)
      .map((l) => ({
        id: l.id,
        name: l.name || '',
        query: [l.address, l.city].filter(Boolean).join(', '),
        rating: l.avg_rating || 0,
      }));
    webRef.current.injectJavaScript(
      `window.__setMarkers(${JSON.stringify(data)}); true;`
    );
  }

  useEffect(() => { pushMarkers(); }, [locals]);

  useEffect(() => {
    if (!readyRef.current || !webRef.current || !userLocation) return;
    webRef.current.injectJavaScript(
      `window.__setUser(${userLocation.latitude}, ${userLocation.longitude}); true;`
    );
  }, [userLocation]);

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  html, body, #map { height: 100%; margin: 0; padding: 0; background: ${colors.bg}; }
  .leaflet-popup-content-wrapper { background: ${colors.surface}; color: #fff; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); }
  .leaflet-popup-tip { background: ${colors.surface}; }
  .leaflet-container a.leaflet-popup-close-button { color: #aaa; }
  .pin {
    width: 30px; height: 30px; border-radius: 50%;
    background: ${colors.primary}; color: #000;
    display: flex; align-items: center; justify-content: center;
    font-weight: 800; font-size: 14px; border: 2px solid ${colors.bg};
    box-shadow: 0 2px 6px rgba(0,0,0,0.5);
  }
  .userdot {
    width: 16px; height: 16px; border-radius: 50%;
    background: ${colors.info}; border: 3px solid #fff;
    box-shadow: 0 0 0 4px rgba(59,130,246,0.3);
  }
  .pop-name { font-weight: 700; font-size: 14px; margin-bottom: 4px; }
  .pop-rating { color: ${colors.primary}; font-size: 12px; margin-bottom: 6px; }
  .pop-btn {
    display: inline-block; background: ${colors.primary}; color: #000;
    font-weight: 700; font-size: 12px; padding: 5px 10px; border-radius: 8px;
    text-decoration: none;
  }
</style>
</head>
<body>
<div id="map"></div>
<script>
  var map = L.map('map', { zoomControl: false, attributionControl: true })
    .setView([${center.latitude}, ${center.longitude}], 13);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    subdomains: 'abcd', maxZoom: 19,
    attribution: '&copy; OpenStreetMap &copy; CARTO'
  }).addTo(map);

  var markersLayer = L.layerGroup().addTo(map);
  var userMarker = null;
  var geoQueue = [];
  var geoBusy = false;
  var addedIds = {};

  function pinIcon(letter) {
    return L.divIcon({
      className: '', html: '<div class="pin">' + letter + '</div>',
      iconSize: [30, 30], iconAnchor: [15, 15], popupAnchor: [0, -16]
    });
  }

  function cacheGet(q) {
    try { return JSON.parse(localStorage.getItem('geo:' + q)); } catch (e) { return null; }
  }
  function cacheSet(q, c) {
    try { localStorage.setItem('geo:' + q, JSON.stringify(c)); } catch (e) {}
  }

  function addMarker(l, lat, lng) {
    if (addedIds[l.id]) return;
    addedIds[l.id] = true;
    var letter = l.name ? l.name.charAt(0).toUpperCase() : '?';
    var m = L.marker([lat, lng], { icon: pinIcon(letter) });
    var rating = l.rating > 0 ? '<div class="pop-rating">&#9733; ' + l.rating.toFixed(1) + '</div>' : '';
    var html = '<div class="pop-name">' + (l.name || '') + '</div>' + rating +
      '<a class="pop-btn" href="#" onclick="window.__open(\\'' + l.id + '\\');return false;">Ver detalles</a>';
    m.bindPopup(html);
    markersLayer.addLayer(m);
  }

  function processQueue() {
    if (geoBusy) return;
    var l = geoQueue.shift();
    if (!l) return;
    geoBusy = true;

    var cached = cacheGet(l.query);
    if (cached) {
      addMarker(l, cached[0], cached[1]);
      geoBusy = false;
      processQueue();
      return;
    }

    fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(l.query))
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data && data[0]) {
          var lat = parseFloat(data[0].lat), lng = parseFloat(data[0].lon);
          cacheSet(l.query, [lat, lng]);
          addMarker(l, lat, lng);
        }
      })
      .catch(function () {})
      .finally(function () {
        // Respetar la política de uso de Nominatim (~1 req/seg)
        setTimeout(function () { geoBusy = false; processQueue(); }, 1100);
      });
  }

  window.__setMarkers = function(list) {
    markersLayer.clearLayers();
    addedIds = {};
    geoQueue = list.slice();
    processQueue();
  };

  window.__setUser = function(lat, lng) {
    if (userMarker) { map.removeLayer(userMarker); }
    userMarker = L.marker([lat, lng], {
      icon: L.divIcon({ className: '', html: '<div class="userdot"></div>', iconSize: [16,16], iconAnchor: [8,8] })
    }).addTo(map);
  };

  window.__centerOn = function(lat, lng) {
    map.flyTo([lat, lng], 15, { duration: 0.6 });
  };

  window.__open = function(id) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'open', id: id }));
    }
  };

  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready' }));
  }
</script>
</body>
</html>`;

  return (
    <WebView
      ref={webRef}
      originWhitelist={['*']}
      source={{ html }}
      style={{ flex: 1, backgroundColor: colors.bg }}
      javaScriptEnabled
      domStorageEnabled
      onMessage={(e) => {
        let msg;
        try { msg = JSON.parse(e.nativeEvent.data); } catch { return; }
        if (msg.type === 'ready') {
          readyRef.current = true;
          pushMarkers();
          if (userLocation) {
            webRef.current?.injectJavaScript(
              `window.__setUser(${userLocation.latitude}, ${userLocation.longitude}); true;`
            );
          }
        } else if (msg.type === 'open' && msg.id != null) {
          onSelectLocal?.(msg.id);
        }
      }}
    />
  );
});

export default MapWebView;
