import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme';

const { width } = Dimensions.get('window');

/**
 * Intro animada de marca que se muestra al abrir la app.
 * Anima: halo dorado → logo (escala+rebote) → marca (deslizar) → tagline (fade).
 * Llama a onFinish() cuando termina.
 */
export default function AnimatedSplash({ onFinish }) {
  const logoScale   = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const haloScale   = useRef(new Animated.Value(0.6)).current;
  const haloOpacity = useRef(new Animated.Value(0)).current;
  const brandY      = useRef(new Animated.Value(16)).current;
  const brandOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const rootOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      // Halo + logo aparecen
      Animated.parallel([
        Animated.timing(haloOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(haloScale,   { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(logoScale,   { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
      ]),
      // Marca se desliza hacia arriba
      Animated.parallel([
        Animated.timing(brandOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(brandY,       { toValue: 0, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      // Tagline
      Animated.timing(taglineOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
      // Pausa breve
      Animated.delay(600),
    ]).start(() => {
      // Fade out de toda la intro
      Animated.timing(rootOpacity, { toValue: 0, duration: 350, useNativeDriver: true }).start(() => {
        onFinish?.();
      });
    });
  }, []);

  // Pulso continuo del halo mientras se muestra
  const haloPulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(haloPulse, { toValue: 1.12, duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(haloPulse, { toValue: 1,    duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity: rootOpacity, zIndex: 999 }]}>
      <LinearGradient colors={['#13100A', '#0A0A0A', '#0A0A0A']} style={styles.container}>
        <View style={styles.center}>
          {/* Halo dorado difuminado */}
          <Animated.View
            style={[
              styles.halo,
              { opacity: haloOpacity, transform: [{ scale: Animated.multiply(haloScale, haloPulse) }] },
            ]}
          />
          {/* Logo — círculo dorado con D negra (contrasta con el halo) */}
          <Animated.View style={[styles.logoCircle, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
            <Text style={styles.logoText}>D</Text>
          </Animated.View>

          {/* Marca */}
          <Animated.Text
            style={[styles.brand, { opacity: brandOpacity, transform: [{ translateY: brandY }] }]}
          >
            Dirbook
          </Animated.Text>

          {/* Tagline */}
          <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
            Conectando tu ciudad
          </Animated.Text>
        </View>

        {/* Pie */}
        <Animated.Text style={[styles.footer, { opacity: taglineOpacity }]}>
          dirbook.com.co
        </Animated.Text>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  center: { alignItems: 'center', justifyContent: 'center' },
  halo: {
    position: 'absolute',
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: colors.primary,
    opacity: 0.18,
    // simula glow
    shadowColor: colors.primary,
    shadowOpacity: 0.6,
    shadowRadius: 60,
    top: -width * 0.18,
  },
  logoCircle: {
    width: 132, height: 132, borderRadius: 66,
    backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
  },
  logoText: { fontSize: 76, fontWeight: '900', color: '#000', marginTop: -2 },
  brand: { fontSize: 38, fontWeight: '900', color: colors.text, letterSpacing: -1, marginTop: 28 },
  tagline: { fontSize: 14, color: colors.textSecondary, marginTop: 6, letterSpacing: 0.3 },
  footer: { position: 'absolute', bottom: 44, fontSize: 12, color: colors.textMuted, letterSpacing: 1 },
});
