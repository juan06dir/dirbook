import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Animated,
  Platform,
} from 'react-native';
import MapView, { Marker, Callout, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getLocals, followLocal, unfollowLocal, getMyFollows } from '../../api';
import LocalCard from '../../components/LocalCard';
import CategoryPill from '../../components/CategoryPill';
import { colors, spacing, radius, shadow } from '../../theme';
import { useAuth } from '../../context/AuthContext';

// ─── Constants ───────────────────────────────────────────────────────────────

const BOGOTA = { latitude: 4.7109, longitude: -74.0721 };
const DELTA = { latitudeDelta: 0.08, longitudeDelta: 0.08 };
const LIMIT = 20;

const CATEGORIES = [
  'Todos', 'Restaurante', 'Tienda', 'Servicio', 'Salud',
  'Educación', 'Tecnología', 'Moda', 'Entretenimiento', 'Otro',
];

// Dark map style for Google/Apple maps
const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0a0a0a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#888888' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2a2a2a' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1a1a1a' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#353535' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d0d0d' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#1e1e1e' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#666666' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#2a2a2a' }] },
  { featureType: 'administrative.country', elementType: 'labels.text.fill', stylers: [{ color: '#777777' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#aaaaaa' }] },
];

// ─── Marker bubble ───────────────────────────────────────────────────────────

function BusinessMarker({ local }) {
  const initial = local.name ? local.name.charAt(0).toUpperCase() : '?';
  return (
    <View style={markerStyles.bubble}>
      <Text style={markerStyles.initial}>{initial}</Text>
    </View>
  );
}

const markerStyles = StyleSheet.create({
  bubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.bg,
    ...Platform.select({
      android: { elevation: 4 },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 3,
      },
    }),
  },
  initial: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.bg,
  },
});

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function ExploreScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const mapRef = useRef(null);

  // Filters
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todos');
  const [city, setCity] = useState('');

  // Data
  const [locals, setLocals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // View
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'

  // Location
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  // Follows
  const [followedIds, setFollowedIds] = useState(new Set());
  const [followLoading, setFollowLoading] = useState(new Set()); // IDs currently being toggled

  // ── Location ──────────────────────────────────────────────────────────────

  const requestLocation = useCallback(async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setUserLocation(BOGOTA);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setUserLocation({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
    } catch {
      setUserLocation(BOGOTA);
    } finally {
      setLocationLoading(false);
    }
  }, []);

  useEffect(() => {
    requestLocation();
  }, []);

  // ── Follows ───────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const follows = await getMyFollows();
        const ids = new Set((follows || []).map((f) => f.local_id ?? f.id));
        setFollowedIds(ids);
      } catch {
        // not critical
      }
    })();
  }, [user]);

  const handleFollow = useCallback(async (local) => {
    if (!user) return;
    const id = local.id;
    const isFollowing = followedIds.has(id);

    // Optimistic toggle
    setFollowedIds((prev) => {
      const next = new Set(prev);
      if (isFollowing) next.delete(id);
      else next.add(id);
      return next;
    });
    setFollowLoading((prev) => new Set(prev).add(id));

    try {
      if (isFollowing) {
        await unfollowLocal(id);
      } else {
        await followLocal(id);
      }
    } catch {
      // Revert on error
      setFollowedIds((prev) => {
        const next = new Set(prev);
        if (isFollowing) next.add(id);
        else next.delete(id);
        return next;
      });
    } finally {
      setFollowLoading((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, [user, followedIds]);

  // ── Data loading ──────────────────────────────────────────────────────────

  const loadLocals = useCallback(async (reset = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const skip = reset ? 0 : page * LIMIT;
      const params = { limit: LIMIT, skip };
      if (query.trim()) params.search = query.trim();
      if (category !== 'Todos') params.category = category;
      if (city.trim()) params.city = city.trim();

      const data = await getLocals(params);
      const results = data || [];

      if (reset) {
        setLocals(results);
        setPage(1);
      } else {
        setLocals((prev) => [...prev, ...results]);
        setPage((p) => p + 1);
      }
      setHasMore(results.length === LIMIT);
    } catch (e) {
      console.warn('ExploreScreen loadLocals:', e);
    } finally {
      setLoading(false);
    }
  }, [query, category, city, page, loading]);

  // Debounced filter reload
  useEffect(() => {
    const timer = setTimeout(() => loadLocals(true), 350);
    return () => clearTimeout(timer);
  }, [query, category, city]);

  // ── Map helpers ───────────────────────────────────────────────────────────

  const centerOnUser = () => {
    if (!userLocation || !mapRef.current) return;
    mapRef.current.animateToRegion(
      { ...userLocation, ...DELTA },
      600,
    );
  };

  const mapLocals = locals.filter(
    (l) => l.latitude != null && l.longitude != null,
  );

  const initialRegion = {
    ...(userLocation || BOGOTA),
    ...DELTA,
  };

  // ── Render helpers ────────────────────────────────────────────────────────

  const renderLocalCard = ({ item }) => (
    <LocalCard
      local={item}
      onPress={() => navigation.navigate('LocalDetalle', { local: item })}
      showFollow={!!user}
      following={followedIds.has(item.id)}
      onFollow={() => handleFollow(item)}
    />
  );

  const listEmpty = !loading && (
    <View style={styles.empty}>
      <Ionicons name="storefront-outline" size={52} color={colors.textMuted} />
      <Text style={styles.emptyTitle}>Sin resultados</Text>
      <Text style={styles.emptySubtitle}>Prueba con otros filtros o ciudad</Text>
    </View>
  );

  const listFooter = loading ? (
    <ActivityIndicator color={colors.primary} style={styles.footerLoader} />
  ) : null;

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      {/* ── Header controls ── */}
      <View style={styles.header}>

        {/* Toggle: Lista / Mapa */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'list' && styles.toggleBtnActive]}
            onPress={() => setViewMode('list')}
            activeOpacity={0.75}
          >
            <Ionicons
              name="list"
              size={16}
              color={viewMode === 'list' ? colors.bg : colors.textSecondary}
            />
            <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>
              Lista
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'map' && styles.toggleBtnActive]}
            onPress={() => setViewMode('map')}
            activeOpacity={0.75}
          >
            <Ionicons
              name="map"
              size={16}
              color={viewMode === 'map' ? colors.bg : colors.textSecondary}
            />
            <Text style={[styles.toggleText, viewMode === 'map' && styles.toggleTextActive]}>
              Mapa
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={17} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar negocios..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* City filter */}
        <View style={styles.cityBar}>
          <Ionicons name="location-outline" size={15} color={colors.textMuted} />
          <TextInput
            style={styles.cityInput}
            placeholder="Filtrar por ciudad..."
            placeholderTextColor={colors.textMuted}
            value={city}
            onChangeText={setCity}
            returnKeyType="done"
          />
          {city.length > 0 && (
            <TouchableOpacity onPress={() => setCity('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={17} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Category pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsContent}
          style={styles.pills}
        >
          {CATEGORIES.map((cat) => (
            <CategoryPill
              key={cat}
              label={cat}
              active={category === cat}
              onPress={() => setCategory(cat)}
            />
          ))}
        </ScrollView>
      </View>

      {/* ── Content area ── */}
      {viewMode === 'list' ? (

        /* LIST VIEW */
        <FlatList
          data={locals}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderLocalCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={() => hasMore && !loading && loadLocals()}
          onEndReachedThreshold={0.35}
          ListFooterComponent={listFooter}
          ListEmptyComponent={listEmpty}
        />

      ) : (

        /* MAP VIEW */
        <View style={styles.mapContainer}>
          {(locationLoading && !userLocation) ? (
            <View style={styles.mapLoading}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.mapLoadingText}>Obteniendo ubicación...</Text>
            </View>
          ) : (
            <>
              <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_DEFAULT}
                initialRegion={initialRegion}
                customMapStyle={DARK_MAP_STYLE}
                showsUserLocation
                showsMyLocationButton={false}
                showsCompass={false}
                toolbarEnabled={false}
              >
                {/* Business markers */}
                {mapLocals.map((local) => (
                  <Marker
                    key={String(local.id)}
                    coordinate={{
                      latitude: local.latitude,
                      longitude: local.longitude,
                    }}
                  >
                    <BusinessMarker local={local} />

                    <Callout
                      onPress={() => navigation.navigate('LocalDetalle', { local })}
                      style={styles.callout}
                    >
                      <View style={styles.calloutInner}>
                        <Text style={styles.calloutName} numberOfLines={1}>
                          {local.name}
                        </Text>
                        {local.avg_rating > 0 && (
                          <View style={styles.calloutRating}>
                            <Ionicons name="star" size={12} color={colors.primary} />
                            <Text style={styles.calloutRatingText}>
                              {local.avg_rating.toFixed(1)}
                            </Text>
                          </View>
                        )}
                        <View style={styles.calloutBtn}>
                          <Text style={styles.calloutBtnText}>Ver detalles</Text>
                        </View>
                      </View>
                    </Callout>
                  </Marker>
                ))}
              </MapView>

              {/* Mi ubicación FAB */}
              <TouchableOpacity
                style={styles.fab}
                onPress={centerOnUser}
                activeOpacity={0.8}
              >
                <Ionicons name="locate" size={22} color={colors.bg} />
              </TouchableOpacity>

              {/* No map data notice */}
              {mapLocals.length === 0 && !loading && (
                <View style={styles.mapEmptyBanner}>
                  <Text style={styles.mapEmptyText}>
                    Ningún negocio en el mapa para estos filtros
                  </Text>
                </View>
              )}

              {loading && (
                <View style={styles.mapLoaderBadge}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              )}
            </>
          )}
        </View>
      )}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  // ── Header ──
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: 0,
    gap: spacing.sm,
  },

  // Toggle
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 3,
    alignSelf: 'flex-start',
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: radius.full,
  },
  toggleBtnActive: {
    backgroundColor: colors.primary,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  toggleTextActive: {
    color: colors.bg,
  },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },

  // City
  cityBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cityInput: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
  },

  // Category pills
  pills: {
    maxHeight: 48,
    marginBottom: spacing.xs,
  },
  pillsContent: {
    alignItems: 'center',
    paddingRight: spacing.md,
  },

  // ── List ──
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: 100,
  },
  footerLoader: {
    marginVertical: 24,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 64,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textMuted,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textMuted,
  },

  // ── Map ──
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  mapLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  mapLoadingText: {
    fontSize: 14,
    color: colors.textSecondary,
  },

  // Callout
  callout: {
    width: 180,
  },
  calloutInner: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  calloutName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  calloutRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  calloutRatingText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  calloutBtn: {
    marginTop: 4,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 5,
    alignItems: 'center',
  },
  calloutBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.bg,
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      android: { elevation: 8 },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.35,
        shadowRadius: 5,
      },
    }),
  },

  // Empty map banner
  mapEmptyBanner: {
    position: 'absolute',
    bottom: 88,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(22,22,22,0.92)',
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  mapEmptyText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Loading badge on map
  mapLoaderBadge: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    backgroundColor: 'rgba(22,22,22,0.85)',
    borderRadius: radius.full,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
