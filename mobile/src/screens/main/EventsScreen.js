import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Image, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getEvents } from '../../api';
import CategoryPill from '../../components/CategoryPill';
import { colors, spacing, radius, typography, shadow } from '../../theme';
import { API_URL } from '../../api';

const LOCAL_CATEGORIES = [
  'Todos', 'Restaurante', 'Tienda', 'Servicio', 'Salud',
  'Educación', 'Tecnología', 'Moda', 'Entretenimiento',
];

const PROFESSIONS = [
  'Todas', 'Abogado', 'Médico', 'Arquitecto', 'Contador',
  'Programador', 'Diseñador', 'Psicólogo', 'Ingeniero',
];

function imgUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_URL}${path}`;
}

function formatDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('es-CO', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function getStatus(start, end) {
  const now = Date.now();
  const s = start ? new Date(start).getTime() : null;
  const e = end ? new Date(end).getTime() : null;
  if (e && e < now) return { label: 'Finalizado', color: colors.textMuted };
  if (s && s > now) return { label: 'Próximamente', color: colors.info };
  return { label: 'En curso', color: colors.success };
}

function EventCard({ event, onPress }) {
  const status = getStatus(event.event_start, event.event_end);
  const cover = imgUrl(event.image_url);
  const logo = imgUrl(event.local_logo);
  const isExpired = status.label === 'Finalizado';

  return (
    <TouchableOpacity
      style={[styles.card, shadow.sm, isExpired && styles.expired]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Cover */}
      <View style={styles.cover}>
        {cover ? (
          <Image source={{ uri: cover }} style={styles.coverImg} />
        ) : (
          <View style={styles.coverPlaceholder}>
            <Ionicons name="calendar" size={36} color={colors.primary} />
          </View>
        )}
        {/* Status badge */}
        <View style={[styles.statusBadge, { borderColor: status.color + '44', backgroundColor: status.color + '18' }]}>
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      {/* Body */}
      <View style={styles.body}>
        {/* Source */}
        <View style={styles.sourceRow}>
          {logo ? (
            <Image source={{ uri: logo }} style={styles.sourceLogo} />
          ) : (
            <View style={styles.sourceLogoPlaceholder}>
              <Text style={styles.sourceLogoText}>
                {(event.local_name || event.professional_name || '?')[0].toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={styles.sourceName} numberOfLines={1}>
            {event.local_name || event.professional_name || 'Evento'}
          </Text>
          {event.local_category && (
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{event.local_category}</Text>
            </View>
          )}
          {event.professional_profession && (
            <View style={[styles.typeBadge, { backgroundColor: colors.info + '18', borderColor: colors.info + '44' }]}>
              <Text style={[styles.typeBadgeText, { color: colors.info }]}>{event.professional_profession}</Text>
            </View>
          )}
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {event.title || event.content?.slice(0, 60) || 'Evento'}
        </Text>

        {/* Description */}
        {event.content && (
          <Text style={styles.description} numberOfLines={2}>{event.content}</Text>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          {(event.event_start || event.event_end) && (
            <View style={styles.metaRow}>
              <Ionicons name="calendar-outline" size={12} color={colors.primary} />
              <Text style={styles.metaText}>
                {formatDate(event.event_start)}
                {event.event_end && ` → ${formatDate(event.event_end)}`}
              </Text>
            </View>
          )}
          {event.local_city && (
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={12} color={colors.error} />
              <Text style={styles.metaText}>{event.local_city}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function EventsScreen() {
  const insets = useSafeAreaInsets();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('Todos');
  const [profession, setProfession] = useState('Todas');
  const [upcomingOnly, setUpcomingOnly] = useState(false);
  const [filterTab, setFilterTab] = useState('categoria'); // 'categoria' | 'profesion'

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (city.trim()) params.city = city.trim();
      if (category !== 'Todos') params.category = category;
      if (profession !== 'Todas') params.profession = profession;
      if (upcomingOnly) params.upcoming_only = 'true';
      const data = await getEvents(params);
      setEvents(data || []);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  }, [city, category, profession, upcomingOnly]);

  useEffect(() => {
    const t = setTimeout(() => load(), 300);
    return () => clearTimeout(t);
  }, [load]);

  // Filtro local por texto
  const filtered = events.filter((e) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      e.title?.toLowerCase().includes(q) ||
      e.content?.toLowerCase().includes(q) ||
      e.local_name?.toLowerCase().includes(q) ||
      e.professional_name?.toLowerCase().includes(q)
    );
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title2}>Eventos</Text>
        <Text style={styles.subtitle}>Descubre lo que pasa en tu ciudad</Text>
      </View>

      {/* Search + city */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar eventos..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <View style={styles.cityBar}>
          <Ionicons name="location-outline" size={14} color={colors.textMuted} />
          <TextInput
            style={styles.cityInput}
            placeholder="Ciudad"
            placeholderTextColor={colors.textMuted}
            value={city}
            onChangeText={setCity}
          />
        </View>
      </View>

      {/* Upcoming toggle */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, upcomingOnly && styles.toggleBtnActive]}
          onPress={() => setUpcomingOnly(v => !v)}
        >
          <Ionicons name="time-outline" size={14} color={upcomingOnly ? '#000' : colors.textMuted} />
          <Text style={[styles.toggleText, upcomingOnly && styles.toggleTextActive]}>Solo próximos</Text>
        </TouchableOpacity>
        {(city || category !== 'Todos' || profession !== 'Todas' || upcomingOnly) && (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => { setCity(''); setCategory('Todos'); setProfession('Todas'); setUpcomingOnly(false); }}
          >
            <Ionicons name="close-circle" size={16} color={colors.textMuted} />
            <Text style={styles.clearText}>Limpiar filtros</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter tabs */}
      <View style={styles.filterTabs}>
        <TouchableOpacity
          style={[styles.filterTab, filterTab === 'categoria' && styles.filterTabActive]}
          onPress={() => setFilterTab('categoria')}
        >
          <Text style={[styles.filterTabText, filterTab === 'categoria' && styles.filterTabTextActive]}>
            Tipo de local
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filterTab === 'profesion' && styles.filterTabActive]}
          onPress={() => setFilterTab('profesion')}
        >
          <Text style={[styles.filterTabText, filterTab === 'profesion' && styles.filterTabTextActive]}>
            Profesión
          </Text>
        </TouchableOpacity>
      </View>

      {filterTab === 'categoria' && (
        <ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsContent}
          style={styles.pills}
        >
          {LOCAL_CATEGORIES.map((c) => (
            <CategoryPill key={c} label={c} active={category === c} onPress={() => setCategory(c)} />
          ))}
        </ScrollView>
      )}

      {filterTab === 'profesion' && (
        <ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsContent}
          style={styles.pills}
        >
          {PROFESSIONS.map((p) => (
            <CategoryPill key={p} label={p} active={profession === p} onPress={() => setProfession(p)} />
          ))}
        </ScrollView>
      )}

      {/* Results */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EventCard event={item} onPress={() => {}} />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          !loading && (
            <Text style={styles.count}>
              {filtered.length} evento{filtered.length !== 1 ? 's' : ''}
            </Text>
          )
        }
        ListFooterComponent={
          loading ? <ActivityIndicator color={colors.primary} style={{ margin: spacing.xl }} /> : null
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.empty}>
              <Ionicons name="calendar-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No hay eventos</Text>
              <Text style={styles.emptySubtitle}>Prueba con otros filtros</Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  title2: { ...typography.h2 },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  searchSection: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.surface, borderRadius: radius.full,
    paddingHorizontal: spacing.md, paddingVertical: 10,
    borderWidth: 1, borderColor: colors.border,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.text },
  cityBar: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.surface, borderRadius: radius.full,
    paddingHorizontal: spacing.md, paddingVertical: 8,
    borderWidth: 1, borderColor: colors.border,
  },
  cityInput: { flex: 1, fontSize: 13, color: colors.text },
  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, gap: spacing.md, marginBottom: spacing.sm },
  toggleBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: radius.full, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  toggleBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  toggleText: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  toggleTextActive: { color: '#000' },
  clearBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  clearText: { fontSize: 12, color: colors.textMuted },
  filterTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1, borderBottomColor: colors.border,
    marginHorizontal: spacing.md,
  },
  filterTab: { paddingVertical: 8, paddingHorizontal: 12 },
  filterTabActive: { borderBottomWidth: 2, borderBottomColor: colors.primary },
  filterTabText: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  filterTabTextActive: { color: colors.primary },
  pills: { maxHeight: 48, marginVertical: 4 },
  pillsContent: { paddingHorizontal: spacing.md, alignItems: 'center' },
  list: { paddingHorizontal: spacing.md, paddingBottom: 100 },
  count: { fontSize: 12, color: colors.textMuted, paddingVertical: spacing.sm },
  empty: { alignItems: 'center', paddingTop: 50, gap: spacing.sm },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.textMuted },
  emptySubtitle: { fontSize: 13, color: colors.textMuted },
  // Card
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  expired: { opacity: 0.55 },
  cover: { height: 150, backgroundColor: colors.surface2, justifyContent: 'center', alignItems: 'center' },
  coverImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  coverPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  statusBadge: {
    position: 'absolute', top: 10, left: 10,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: radius.full, borderWidth: 1,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  body: { padding: spacing.md },
  sourceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  sourceLogo: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  sourceLogoPlaceholder: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: colors.primaryFaded,
    justifyContent: 'center', alignItems: 'center',
  },
  sourceLogoText: { fontSize: 10, fontWeight: '700', color: colors.primary },
  sourceName: { flex: 1, fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  typeBadge: {
    backgroundColor: colors.primaryFaded,
    borderColor: colors.primary + '44',
    borderWidth: 1,
    paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: radius.full,
  },
  typeBadgeText: { fontSize: 10, fontWeight: '600', color: colors.primary },
  title: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 4, lineHeight: 20 },
  description: { fontSize: 13, color: colors.textSecondary, lineHeight: 17, marginBottom: spacing.sm },
  footer: { gap: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 12, color: colors.textMuted },
});
