import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, shadow } from '../theme';
import { API_URL } from '../api';

const CATEGORY_ICONS = {
  restaurante: 'restaurant',
  tienda: 'bag',
  servicio: 'construct',
  salud: 'medical',
  educacion: 'school',
  entretenimiento: 'game-controller',
  tecnologia: 'laptop',
  moda: 'shirt',
  default: 'storefront',
};

function getCategoryIcon(category) {
  if (!category) return CATEGORY_ICONS.default;
  const lower = category.toLowerCase();
  for (const key of Object.keys(CATEGORY_ICONS)) {
    if (lower.includes(key)) return CATEGORY_ICONS[key];
  }
  return CATEGORY_ICONS.default;
}

function imageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_URL}${path}`;
}

export default function LocalCard({ local, onPress, horizontal = false }) {
  const rating = local.avg_rating ? local.avg_rating.toFixed(1) : null;
  const logoUri = imageUrl(local.logo);

  if (horizontal) {
    return (
      <TouchableOpacity style={[styles.hCard, shadow.sm]} onPress={onPress} activeOpacity={0.8}>
        <View style={styles.hLogo}>
          {logoUri ? (
            <Image source={{ uri: logoUri }} style={styles.hLogoImg} />
          ) : (
            <View style={styles.hLogoPlaceholder}>
              <Ionicons name={getCategoryIcon(local.category)} size={22} color={colors.primary} />
            </View>
          )}
        </View>
        <View style={styles.hInfo}>
          <Text style={styles.hName} numberOfLines={1}>{local.name}</Text>
          <Text style={styles.hCategory} numberOfLines={1}>{local.category || 'Negocio'}</Text>
          <View style={styles.hMeta}>
            {rating && (
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={11} color={colors.primary} />
                <Text style={styles.ratingText}>{rating}</Text>
              </View>
            )}
            {local.city && (
              <View style={styles.ratingRow}>
                <Ionicons name="location" size={11} color={colors.textMuted} />
                <Text style={styles.cityText}>{local.city}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  const coverUri = imageUrl(local.cover_image);

  return (
    <TouchableOpacity style={[styles.card, shadow.md]} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.cover}>
        {coverUri ? (
          <Image source={{ uri: coverUri }} style={styles.coverImg} />
        ) : (
          <View style={styles.coverPlaceholder}>
            <Ionicons name={getCategoryIcon(local.category)} size={36} color={colors.primary} />
          </View>
        )}
        {local.category && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{local.category}</Text>
          </View>
        )}
      </View>
      <View style={styles.body}>
        <View style={styles.row}>
          <View style={styles.logoWrap}>
            {logoUri ? (
              <Image source={{ uri: logoUri }} style={styles.logoImg} />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Ionicons name={getCategoryIcon(local.category)} size={16} color={colors.primary} />
              </View>
            )}
          </View>
          <View style={styles.nameWrap}>
            <Text style={styles.name} numberOfLines={1}>{local.name}</Text>
            {local.city && (
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={11} color={colors.textMuted} />
                <Text style={styles.location}>{local.city}</Text>
              </View>
            )}
          </View>
        </View>
        {local.description && (
          <Text style={styles.description} numberOfLines={2}>{local.description}</Text>
        )}
        <View style={styles.footer}>
          {rating && (
            <View style={styles.ratingPill}>
              <Ionicons name="star" size={12} color={colors.primary} />
              <Text style={styles.ratingPillText}>{rating}</Text>
              {local.ratings_count > 0 && (
                <Text style={styles.ratingCount}>({local.ratings_count})</Text>
              )}
            </View>
          )}
          {local.followers_count > 0 && (
            <View style={styles.followPill}>
              <Ionicons name="heart" size={12} color={colors.error} />
              <Text style={styles.followText}>{local.followers_count}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Vertical card
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  cover: {
    height: 140,
    backgroundColor: colors.surface2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  coverPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeText: { color: colors.textSecondary, fontSize: 11, fontWeight: '600' },
  body: { padding: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  logoWrap: { width: 40, height: 40, borderRadius: radius.md, overflow: 'hidden', marginRight: spacing.sm },
  logoImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  logoPlaceholder: {
    width: '100%', height: '100%',
    backgroundColor: colors.surface2,
    justifyContent: 'center', alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
  },
  nameWrap: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  location: { fontSize: 12, color: colors.textMuted },
  description: { fontSize: 13, color: colors.textSecondary, lineHeight: 18, marginBottom: spacing.sm },
  footer: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  ratingPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.primaryFaded,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: radius.full,
  },
  ratingPillText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  ratingCount: { fontSize: 11, color: colors.textMuted },
  followPill: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  followText: { fontSize: 12, color: colors.textMuted },

  // Horizontal card
  hCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginRight: spacing.md,
    width: 200,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hLogo: { width: 50, height: 50, borderRadius: radius.md, overflow: 'hidden', marginRight: spacing.sm },
  hLogoImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  hLogoPlaceholder: {
    width: '100%', height: '100%',
    backgroundColor: colors.surface2,
    justifyContent: 'center', alignItems: 'center',
  },
  hInfo: { flex: 1 },
  hName: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 2 },
  hCategory: { fontSize: 11, color: colors.textMuted, marginBottom: 4 },
  hMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingText: { fontSize: 11, fontWeight: '600', color: colors.primary },
  cityText: { fontSize: 11, color: colors.textMuted },
});
