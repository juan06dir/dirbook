import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, FlatList, TouchableOpacity,
  StyleSheet, RefreshControl, ActivityIndicator, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getLocals, getPosts } from '../../api';
import { useAuth } from '../../context/AuthContext';
import LocalCard from '../../components/LocalCard';
import PostCard from '../../components/PostCard';
import { colors, spacing, radius, typography } from '../../theme';

const CATEGORIES = [
  { label: 'Restaurantes', icon: 'restaurant' },
  { label: 'Tiendas', icon: 'storefront' },
  { label: 'Salud', icon: 'medkit' },
  { label: 'Belleza', icon: 'cut' },
  { label: 'Servicios', icon: 'construct' },
  { label: 'Tecnología', icon: 'hardware-chip' },
  { label: 'Otros', icon: 'apps' },
];

const CARD_WIDTH = 270 + spacing.md; // LocalCard horizontal width + margin

function FadeInSection({ delay = 0, children }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 450, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 450, delay, useNativeDriver: true }),
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
  const [topLocals, setTopLocals] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [locals, disc, evts] = await Promise.all([
        getLocals({ limit: 10 }),
        getPosts({ post_type: 'discount', limit: 5 }),
        getPosts({ post_type: 'event', limit: 5 }),
      ]);
      setTopLocals(locals?.slice(0, 10) || []);
      setDiscounts(disc || []);
      setEvents(evts || []);
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

  if (loading) {
    return (
      <View style={styles.loadWrap}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <LinearGradient
        colors={['#1A1604', '#0F0D04', '#0A0A0A']}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>
              {greeting()}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
            </Text>
            <Text style={styles.subtitle}>Descubre lo mejor cerca de ti</Text>
          </View>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => navigation.navigate('Notificaciones')}
            activeOpacity={0.8}
          >
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>

        {/* Search bar */}
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

        {/* Category chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesRow}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.label}
              style={styles.categoryChip}
              onPress={() => navigation.navigate('Explorar')}
              activeOpacity={0.8}
            >
              <View style={styles.categoryIconCircle}>
                <Ionicons name={cat.icon} size={16} color={colors.primary} />
              </View>
              <Text style={styles.categoryLabel}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>

      {/* Top Negocios */}
      {topLocals.length > 0 && (
        <FadeInSection delay={50}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Negocios destacados</Text>
                <Text style={styles.sectionSub}>Los favoritos de tu zona</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('Explorar')} style={styles.seeAllBtn}>
                <Text style={styles.seeAll}>Ver todos</Text>
                <Ionicons name="chevron-forward" size={13} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              data={topLocals}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <LocalCard
                  local={item}
                  horizontal
                  onPress={() => navigation.navigate('LocalDetalle', { local: item })}
                />
              )}
              showsHorizontalScrollIndicator={false}
              snapToInterval={CARD_WIDTH}
              decelerationRate="fast"
              contentContainerStyle={{ paddingHorizontal: spacing.lg }}
            />
          </View>
        </FadeInSection>
      )}

      {/* Descuentos activos */}
      {discounts.length > 0 && (
        <FadeInSection delay={150}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={[styles.sectionIcon, { backgroundColor: 'rgba(245,158,11,0.12)' }]}>
                  <Ionicons name="pricetag" size={15} color={colors.warning} />
                </View>
                <Text style={styles.sectionTitle}>Descuentos activos</Text>
              </View>
            </View>
            <View style={{ paddingHorizontal: spacing.lg }}>
              {discounts.map((p) => <PostCard key={p.id} post={p} />)}
            </View>
          </View>
        </FadeInSection>
      )}

      {/* Eventos */}
      {events.length > 0 && (
        <FadeInSection delay={250}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={[styles.sectionIcon, { backgroundColor: 'rgba(34,197,94,0.12)' }]}>
                  <Ionicons name="calendar" size={15} color={colors.success} />
                </View>
                <Text style={styles.sectionTitle}>Próximos eventos</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('Eventos')} style={styles.seeAllBtn}>
                <Text style={styles.seeAll}>Ver todos</Text>
                <Ionicons name="chevron-forward" size={13} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <View style={{ paddingHorizontal: spacing.lg }}>
              {events.map((p) => <PostCard key={p.id} post={p} />)}
            </View>
          </View>
        </FadeInSection>
      )}

      {/* Banner CTA */}
      {!user && (
        <FadeInSection delay={350}>
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
        </FadeInSection>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  loadWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },

  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: spacing.lg,
  },
  greeting: { fontSize: 24, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
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
  },
  searchIconCircle: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  searchPlaceholder: { fontSize: 14, color: colors.textSecondary, fontWeight: '500' },

  categoriesScroll: { marginTop: spacing.lg, marginHorizontal: -spacing.lg },
  categoriesRow: { paddingHorizontal: spacing.lg, gap: spacing.md },
  categoryChip: { alignItems: 'center', width: 66 },
  categoryIconCircle: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(250,204,21,0.10)',
    borderWidth: 1, borderColor: 'rgba(250,204,21,0.22)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 6,
  },
  categoryLabel: { fontSize: 11, fontWeight: '600', color: colors.textSecondary, textAlign: 'center' },

  section: { marginTop: spacing.xl },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  sectionIcon: {
    width: 30, height: 30, borderRadius: 15,
    justifyContent: 'center', alignItems: 'center',
  },
  sectionTitle: { ...typography.h3, fontSize: 18, letterSpacing: -0.3 },
  sectionSub: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  seeAll: { fontSize: 13, color: colors.primary, fontWeight: '700' },

  ctaBanner: { margin: spacing.lg, borderRadius: radius.xl, overflow: 'hidden' },
  ctaGradient: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: spacing.xl, gap: spacing.md,
  },
  ctaTitle: { fontSize: 18, fontWeight: '800', color: '#000', marginBottom: 2 },
  ctaSubtitle: { fontSize: 13, color: 'rgba(0,0,0,0.65)' },
});
