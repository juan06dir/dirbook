import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  Animated, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius } from '../theme';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    icon: 'compass',
    title: 'Descubre tu ciudad',
    desc: 'Encuentra los mejores locales, restaurantes y tiendas cerca de ti, todo en un solo lugar.',
  },
  {
    icon: 'people',
    title: 'Conecta con profesionales',
    desc: 'Plomeros, electricistas, estilistas y más. Contacta directo a quien necesitas, cuando lo necesitas.',
  },
  {
    icon: 'pricetags',
    title: 'Ofertas y eventos',
    desc: 'Aprovecha descuentos exclusivos y entérate de los eventos que pasan en tu zona.',
  },
  {
    icon: 'rocket',
    title: '¿Tienes un negocio?',
    desc: 'Publícalo gratis y llega a miles de personas que buscan justo lo que ofreces.',
  },
];

export default function OnboardingScreen({ onFinish }) {
  const insets = useSafeAreaInsets();
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef(null);
  const [index, setIndex] = useState(0);

  function goTo(i) {
    scrollRef.current?.scrollTo({ x: i * width, animated: true });
  }

  function handleNext() {
    if (index < SLIDES.length - 1) {
      goTo(index + 1);
    } else {
      onFinish?.();
    }
  }

  function onMomentumEnd(e) {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    setIndex(i);
  }

  const isLast = index === SLIDES.length - 1;

  return (
    <LinearGradient colors={['#14110A', '#0A0A0A', '#0A0A0A']} style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Saltar */}
      <TouchableOpacity
        style={[styles.skip, { top: insets.top + 8 }]}
        onPress={onFinish}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.skipText}>Saltar</Text>
      </TouchableOpacity>

      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        onMomentumScrollEnd={onMomentumEnd}
        style={{ flex: 1 }}
      >
        {SLIDES.map((slide, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.6, 1, 0.6],
            extrapolate: 'clamp',
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });
          return (
            <View key={i} style={[styles.slide, { width }]}>
              <Animated.View style={[styles.iconWrap, { transform: [{ scale }], opacity }]}>
                <View style={styles.iconHalo} />
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={styles.iconCircle}
                >
                  <Ionicons name={slide.icon} size={62} color="#000" />
                </LinearGradient>
              </Animated.View>

              <Animated.View style={{ opacity }}>
                <Text style={styles.title}>{slide.title}</Text>
                <Text style={styles.desc}>{slide.desc}</Text>
              </Animated.View>
            </View>
          );
        })}
      </Animated.ScrollView>

      {/* Indicadores */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          const dotWidth = scrollX.interpolate({
            inputRange, outputRange: [8, 24, 8], extrapolate: 'clamp',
          });
          const dotOpacity = scrollX.interpolate({
            inputRange, outputRange: [0.3, 1, 0.3], extrapolate: 'clamp',
          });
          return (
            <Animated.View
              key={i}
              style={[styles.dot, { width: dotWidth, opacity: dotOpacity }]}
            />
          );
        })}
      </View>

      {/* Botón */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <TouchableOpacity activeOpacity={0.9} onPress={handleNext}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.btn}
          >
            <Text style={styles.btnText}>{isLast ? 'Empezar' : 'Siguiente'}</Text>
            <Ionicons name="arrow-forward" size={18} color="#000" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skip: { position: 'absolute', right: spacing.lg, zIndex: 10, padding: 6 },
  skipText: { color: colors.textMuted, fontSize: 14, fontWeight: '600' },

  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  iconWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xxl },
  iconHalo: {
    position: 'absolute',
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: colors.primary, opacity: 0.12,
  },
  iconCircle: {
    width: 132, height: 132, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45, shadowRadius: 24, elevation: 14,
  },
  title: {
    fontSize: 26, fontWeight: '900', color: colors.text,
    textAlign: 'center', letterSpacing: -0.5, marginBottom: spacing.md,
  },
  desc: {
    fontSize: 15, color: colors.textSecondary, textAlign: 'center',
    lineHeight: 23, paddingHorizontal: spacing.sm,
  },

  dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginBottom: spacing.xl },
  dot: { height: 8, borderRadius: 4, backgroundColor: colors.primary },

  footer: { paddingHorizontal: spacing.lg },
  btn: {
    height: 54, borderRadius: radius.full,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
  },
  btnText: { fontSize: 16, fontWeight: '800', color: '#000' },
});
