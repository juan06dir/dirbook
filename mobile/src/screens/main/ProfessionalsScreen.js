import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getProfessionals } from '../../api';
import ProfessionalCard from '../../components/ProfessionalCard';
import CategoryPill from '../../components/CategoryPill';
import { colors, spacing, radius, typography } from '../../theme';

const PROFESSIONS = [
  'Todos', 'Abogado', 'Médico', 'Arquitecto', 'Contador',
  'Programador', 'Diseñador', 'Psicólogo', 'Ingeniero', 'Otro',
];

export default function ProfessionalsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [profession, setProfession] = useState('Todos');
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (query.trim()) params.search = query.trim();
      if (profession !== 'Todos') params.profession = profession;
      const data = await getProfessionals(params);
      setProfessionals(data || []);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  }, [query, profession]);

  useEffect(() => {
    const t = setTimeout(() => load(), 300);
    return () => clearTimeout(t);
  }, [query, profession]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Profesionales</Text>
        <Text style={styles.subtitle}>Abogados, médicos, contadores y más</Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar profesional..."
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
      </View>

      {/* Profession filter */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContent}
        style={styles.filters}
      >
        {PROFESSIONS.map((p) => (
          <CategoryPill key={p} label={p} active={profession === p} onPress={() => setProfession(p)} />
        ))}
      </ScrollView>

      {/* List */}
      <FlatList
        data={professionals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProfessionalCard
            professional={item}
            onPress={() => navigation.navigate('ProfesionalDetalle', { professional: item })}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          loading ? <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} /> : null
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>No se encontraron profesionales</Text>
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
  title: { ...typography.h2 },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  searchWrap: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md, paddingVertical: 10,
    borderWidth: 1, borderColor: colors.border,
  },
  searchInput: { flex: 1, fontSize: 15, color: colors.text },
  filters: { maxHeight: 52, marginBottom: 4 },
  filtersContent: { paddingHorizontal: spacing.md, alignItems: 'center' },
  list: { paddingHorizontal: spacing.md, paddingBottom: 100 },
  empty: { alignItems: 'center', paddingTop: 60, gap: spacing.sm },
  emptyText: { fontSize: 15, color: colors.textMuted, fontWeight: '600' },
});
