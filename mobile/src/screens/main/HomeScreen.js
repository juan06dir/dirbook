import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, FlatList, TouchableOpacity,
  StyleSheet, RefreshControl, ActivityIndicator, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getLocals, getPosts } from '../../api';
import { useAuth } from '../../context/AuthContext';
import LocalCard from '../../components/LocalCard';
import PostCard from '../../components/PostCard';
import { colors, spacing, radius, typography } from '../../theme';

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
        colors={['#111111', '#0A0A0A']}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>{greeting()}{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋</Text>
            <Text style={styles.subtitle}>Descubre negocios cerca de ti</Text>
          </View>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => navigation.navigate('Notificaciones')}
          >
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Search shortcut */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate('Explorar')}
          activeOpacity={0.8}
        >
          <Ionicons name="search" size={16} color={colors.textMuted} />
          <Text style={styles.searchPlaceholder}>Buscar negocios, servicios...</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Top Negocios */}
      {topLocals.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Negocios destacados</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Explorar')}>
              <Text style={styles.seeAll}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            data={topLocals}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <LocalCard
                local={item}
                horizontal
                onPress={() => navigation.navigate('LocalDetalle', { local: item })}
              />
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: spacing.lg }}
          />
        </View>
      )}

      {/* Descuentos activos */}
      {discounts.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="pricetag" size={16} color={colors.warning} />
              <Text style={styles.sectionTitle}>Descuentos activos</Text>
            </View>
          </View>
          <View style={{ paddingHorizontal: spacing.lg }}>
            {discounts.map((p) => <PostCard key={p.id} post={p} />)}
          </View>
        </View>
      )}

      {/* Eventos */}
      {events.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="calendar" size={16} color={colors.success} />
              <Text style={styles.sectionTitle}>Próximos eventos</Text>
            </View>
          </View>
          <View style={{ paddingHorizontal: spacing.lg }}>
            {events.map((p) => <PostCard key={p.id} post={p} />)}
          </View>
        </View>
      )}

      {/* Banner CTA */}
      {!user && (
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
            <View>
              <Text style={styles.ctaTitle}>¿Tienes un negocio?</Text>
              <Text style={styles.ctaSubtitle}>Regístrate gratis y llega a más clientes</Text>
            </View>
            <Ionicons name="arrow-forward-circle" size={32} color="#000" />
          </LinearGradient>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  loadWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  greeting: { fontSize: 22, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  notifBtn: {
    width: 40, height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.surface2,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md, paddingVertical: 12,
    borderWidth: 1, borderColor: colors.border,
  },
  searchPlaceholder: { fontSize: 14, color: colors.textMuted },
  section: { marginTop: spacing.xl },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  sectionTitle: { ...typography.h3, fontSize: 17 },
  seeAll: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  ctaBanner: { margin: spacing.lg, borderRadius: radius.xl, overflow: 'hidden' },
  ctaGradient: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: spacing.xl,
  },
  ctaTitle: { fontSize: 17, fontWeight: '800', color: '#000', marginBottom: 2 },
  ctaSubtitle: { fontSize: 13, color: 'rgba(0,0,0,0.65)' },
});
