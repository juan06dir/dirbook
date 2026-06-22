import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl, ActivityIndicator, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getPosts } from '../../api';
import { useAuth } from '../../context/AuthContext';
import PostCard from '../../components/PostCard';
import { colors, spacing, radius, typography } from '../../theme';

const QUICK_ACTIONS = [
  { label: 'Locales',       icon: 'storefront', screen: 'Explorar',      color: '#FACC15' },
  { label: 'Profesionales', icon: 'people',     screen: 'Profesionales', color: '#3B82F6' },
  { label: 'Eventos',       icon: 'calendar',   screen: 'Eventos',       color: '#22C55E' },
];

function FadeInSection({ delay = 0, children }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 400, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const feed = await getPosts({ limit: 30 });
      setPosts(feed || []);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function onRefresh() {
    setRefreshing(true);
    load();
  }

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Banner / Header ── */}
      <LinearGradient
        colors={['#1A1604', '#0F0D04', '#0A0A0A']}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        {/* Banner de marca */}
        <View style={styles.brandBar}>
          <Text style={styles.brandName}>
            <Text style={styles.brandD}>D</Text>irbook
          </Text>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => navigation.navigate('Notificaciones')}
            activeOpacity={0.8}
          >
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>

        {/* Saludo */}
        <Text style={styles.greeting}>
          {greeting()}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
        </Text>
        <Text style={styles.subtitle}>Descubre lo que pasa cerca de ti</Text>

        {/* Buscador */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate('Explorar')}
          activeOpacity={0.85}
        >
          <View style={styles.searchIconCircle}>
            <Ionicons name="search" size={16} color="#000" />
          </View>
          <Text style={styles.searchPlaceholder}>¿Qué estás buscando hoy?</Text>
        </TouchableOpacity>

        {/* Accesos rápidos */}
        <View style={styles.quickRow}>
          {QUICK_ACTIONS.map((q) => (
            <TouchableOpacity
              key={q.label}
              style={styles.quickBtn}
              onPress={() => navigation.navigate(q.screen)}
              activeOpacity={0.85}
            >
              <View style={[styles.quickIcon, { backgroundColor: q.color + '22', borderColor: q.color + '55' }]}>
                <Ionicons name={q.icon} size={22} color={q.color} />
              </View>
              <Text style={styles.quickLabel}>{q.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {/* ── Feed de publicaciones ── */}
      <View style={styles.feed}>
        <View style={styles.feedHeader}>
          <Text style={styles.feedTitle}>Publicaciones</Text>
          <Text style={styles.feedSub}>Lo último de los negocios</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 48 }} />
        ) : posts.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="newspaper-outline" size={52} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Aún no hay publicaciones</Text>
            <Text style={styles.emptySub}>Vuelve pronto para ver novedades, ofertas y eventos</Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => navigation.navigate('Explorar')}
              activeOpacity={0.85}
            >
              <Ionicons name="storefront" size={16} color="#000" />
              <Text style={styles.emptyBtnText}>Explorar locales</Text>
            </TouchableOpacity>
          </View>
        ) : (
          posts.map((p, i) => (
            <FadeInSection key={p.id} delay={Math.min(i * 60, 300)}>
              <PostCard post={p} />
            </FadeInSection>
          ))
        )}
      </View>

      {/* Banner CTA para registrarse */}
      {!user && !loading && (
        <TouchableOpacity
          style={styles.ctaBanner}
          onPress={() => navigation.navigate('Register')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[colors.primary, '#D4A817']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.ctaTitle}>¿Tienes un negocio?</Text>
              <Text style={styles.ctaSubtitle}>Regístrate gratis y llega a más clientes</Text>
            </View>
            <Ionicons name="arrow-forward-circle" size={36} color="#000" />
          </LinearGradient>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  // Banner de marca
  brandBar: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: spacing.lg,
  },
  brandName: { fontSize: 26, fontWeight: '900', color: colors.text, letterSpacing: -0.6 },
  brandD: { color: colors.primary },

  greeting: { fontSize: 22, fontWeight: '800', color: colors.text, letterSpacing: -0.4 },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 3 },

  notifBtn: {
    width: 42, height: 42,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  notifDot: {
    position: 'absolute', top: 10, right: 11,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.primary,
    borderWidth: 1.5, borderColor: '#0A0A0A',
  },

  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: radius.full,
    paddingLeft: 6, paddingRight: spacing.md, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(250,204,21,0.25)',
    marginTop: spacing.lg,
  },
  searchIconCircle: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  searchPlaceholder: { fontSize: 14, color: colors.textSecondary, fontWeight: '500' },

  // Accesos rápidos
  quickRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    gap: spacing.sm, marginTop: spacing.lg,
  },
  quickBtn: {
    flex: 1, alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: spacing.md, gap: 7,
  },
  quickIcon: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1,
  },
  quickLabel: { fontSize: 12, fontWeight: '700', color: colors.text },

  // Feed
  feed: { paddingHorizontal: spacing.lg, marginTop: spacing.xl },
  feedHeader: { marginBottom: spacing.md },
  feedTitle: { ...typography.h3, fontSize: 19, letterSpacing: -0.3 },
  feedSub: { fontSize: 12, color: colors.textMuted, marginTop: 1 },

  empty: { alignItems: 'center', paddingTop: 40, gap: spacing.sm },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.textSecondary, marginTop: 4 },
  emptySub: { fontSize: 13, color: colors.textMuted, textAlign: 'center', paddingHorizontal: spacing.lg },
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg, paddingVertical: 11,
    borderRadius: radius.full, marginTop: spacing.md,
  },
  emptyBtnText: { fontSize: 14, fontWeight: '800', color: '#000' },

  // CTA
  ctaBanner: { margin: spacing.lg, borderRadius: radius.xl, overflow: 'hidden' },
  ctaGradient: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: spacing.xl, gap: spacing.md,
  },
  ctaTitle: { fontSize: 18, fontWeight: '800', color: '#000', marginBottom: 2 },
  ctaSubtitle: { fontSize: 13, color: 'rgba(0,0,0,0.65)' },
});
