import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getLocals } from '../../api';
import LocalCard from '../../components/LocalCard';
import CategoryPill from '../../components/CategoryPill';
import { colors, spacing, radius, typography } from '../../theme';

const CATEGORIES = [
  'Todos', 'Restaurante', 'Tienda', 'Servicio', 'Salud', 'Educación',
  'Tecnología', 'Moda', 'Entretenimiento', 'Otro',
];

export default function ExploreScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todos');
  const [city, setCity] = useState('');
  const [locals, setLocals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;

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
        setLocals(prev => [...prev, ...results]);
        setPage(p => p + 1);
      }
      setHasMore(results.length === LIMIT);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  }, [query, category, city, page, loading]);

  useEffect(() => {
    const timer = setTimeout(() => loadLocals(true), 300);
    return () => clearTimeout(timer);
  }, [query, category, city]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      {/* Search bar */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar negocios..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.cityBar}>
          <Ionicons name="location-outline" size={16} color={colors.textMuted} />
          <TextInput
            style={styles.cityInput}
            placeholder="Ciudad (opcional)"
            placeholderTextColor={colors.textMuted}
            value={city}
            onChangeText={setCity}
          />
        </View>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContent}
        style={styles.categories}
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

      {/* Results */}
      <FlatList
        data={locals}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <LocalCard
            local={item}
            onPress={() => navigation.navigate('LocalDetalle', { local: item })}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        onEndReached={() => hasMore && loadLocals()}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          loading ? <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} /> : null
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.empty}>
              <Ionicons name="storefront-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>No se encontraron negocios</Text>
              <Text style={styles.emptySubtext}>Intenta con otros filtros</Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  searchWrap: { padding: spacing.md, gap: spacing.sm },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md, paddingVertical: 10,
    borderWidth: 1, borderColor: colors.border,
  },
  searchInput: { flex: 1, fontSize: 15, color: colors.text },
  cityBar: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md, paddingVertical: 8,
    borderWidth: 1, borderColor: colors.border,
  },
  cityInput: { flex: 1, fontSize: 13, color: colors.text },
  categories: { maxHeight: 52, marginBottom: 4 },
  categoriesContent: { paddingHorizontal: spacing.md, alignItems: 'center' },
  list: { paddingHorizontal: spacing.md, paddingBottom: 100 },
  empty: { alignItems: 'center', paddingTop: 60, gap: spacing.sm },
  emptyText: { ...typography.h3, color: colors.textMuted },
  emptySubtext: { fontSize: 13, color: colors.textMuted },
});
