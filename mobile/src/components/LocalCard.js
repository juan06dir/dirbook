import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, shadow } from '../theme';
import { API_URL } from '../api';
import StarRating from './StarRating';

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

function formatCount(n) {
  if (!n || n === 0) return '0';
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function LocalCard({
  local,
  onPress,
  horizontal = false,
  following = false,
  onFollow = null,
  showFollow = false,
}) {
  const rating = local.avg_rating ? parseFloat(local.avg_rating.toFixed(1)) : 0;
  const logoUri = imageUrl(local.logo);
  const coverUri = imageUrl(local.cover_image);
  const categoryIcon = getCategoryIcon(local.category);

  // ── Horizontal (compact) variant ──────────────────────────────────────────
  if (horizontal) {
    return (
      <TouchableOpacity
        style={[styles.hCard, shadow.sm]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={styles.hLogo}>
          {logoUri ? (
            <Image source={{ uri: logoUri }} style={styles.hLogoImg} />
          ) : (
            <View style={styles.hLogoPlaceholder}>
              <Ionicons name={categoryIcon} size={22} color={colors.primary} />
            </View>
          )}
        </View>
        <View style={styles.hInfo}>
          <Text style={styles.hName} numberOfLines={1}>{local.name}</Text>
          <Text style={styles.hCategory} numberOfLines={1}>
            {local.category || 'Negocio'}
          </Text>
          <View style={styles.hMeta}>
            {rating > 0 && (
              <View style={styles.metaItem}>
                <Ionicons name="star" size={11} color={colors.primary} />
                <Text style={styles.metaRating}>{rating.toFixed(1)}</Text>
              </View>
            )}
            {local.city && (
              <View style={styles.metaItem}>
                <Ionicons name="location" size={11} color={colors.textMuted} />
                <Text style={styles.metaCity}>{local.city}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // ── Vertical (full) variant ───────────────────────────────────────────────
  return (
    <TouchableOpacity
      style={[styles.card, shadow.md]}
      onPress={onPress}
      activeOpacity={0.88}
    >
      {/* Cover image */}
      <View style={styles.cover}>
        {coverUri ? (
          <Image source={{ uri: coverUri }} style={styles.coverImg} />
        ) : (
          <View style={styles.coverPlaceholder}>
            <Ionicons name={categoryIcon} size={44} color={colors.primary} style={{ opacity: 0.6 }} />
          </View>
        )}

        {/* Category badge — top-right */}
        {local.category && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{local.category}</Text>
          </View>
        )}
      </View>

      {/* Card body */}
      <View style={styles.body}>

        {/* Logo + name row */}
        <View style={styles.headerRow}>
          <View style={styles.logoWrap}>
            {logoUri ? (
              <Image source={{ uri: logoUri }} style={styles.logoImg} />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Ionicons name={categoryIcon} size={18} color={colors.primary} />
              </View>
            )}
          </View>
          <View style={styles.nameWrap}>
            <Text style={styles.name} numberOfLines={1}>{local.name}</Text>
            {local.city ? (
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={11} color={colors.textMuted} />
                <Text style={styles.locationText}>{local.city}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Star rating row */}
        {rating > 0 && (
          <View style={styles.ratingRow}>
            <StarRating value={Math.round(rating)} readonly size={13} />
            <Text style={styles.ratingNumber}>{rating.toFixed(1)}</Text>
            {local.ratings_count > 0 && (
              <Text style={styles.ratingCount}>
                ({local.ratings_count})
              </Text>
            )}
          </View>
        )}

        {/* Description */}
        {local.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {local.description}
          </Text>
        ) : null}

        {/* Action row */}
        <View style={styles.actionRow}>
          {/* Left: heart + followers */}
          <View style={styles.likesWrap}>
            <Ionicons name="heart" size={15} color={colors.error} />
            <Text style={styles.likesText}>
              {formatCount(local.followers_count)}
            </Text>
          </View>

          {/* Right: follow button */}
          {showFollow && onFollow ? (
            <TouchableOpacity
              style={[
                styles.followBtn,
                following ? styles.followBtnActive : styles.followBtnOutline,
              ]}
              onPress={onFollow}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.followBtnText,
                  following ? styles.followBtnTextActive : styles.followBtnTextOutline,
                ]}
              >
                {following ? 'Siguiendo' : 'Seguir'}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // ── Vertical card ──
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },

  // Cover
  cover: {
    height: 200,
    backgroundColor: colors.surface2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },

  // Category badge
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.72)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  badgeText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // Body
  body: {
    padding: spacing.md,
    gap: spacing.sm,
  },

  // Logo + name
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  logoImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  logoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surface2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameWrap: { flex: 1 },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  locationText: {
    fontSize: 12,
    color: colors.textMuted,
  },

  // Ratings
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  ratingCount: {
    fontSize: 12,
    color: colors.textMuted,
  },

  // Description
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
  },

  // Action row
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  likesWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  likesText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },

  // Follow button
  followBtn: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: 1.5,
  },
  followBtnOutline: {
    borderColor: colors.primary,
    backgroundColor: 'transparent',
  },
  followBtnActive: {
    borderColor: 'transparent',
    backgroundColor: colors.primary,
  },
  followBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  followBtnTextOutline: {
    color: colors.primary,
  },
  followBtnTextActive: {
    color: colors.bg,
  },

  // ── Horizontal card ──
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
  hLogo: {
    width: 50,
    height: 50,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hLogoImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  hLogoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surface2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hInfo: { flex: 1 },
  hName: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 2 },
  hCategory: { fontSize: 11, color: colors.textMuted, marginBottom: 4 },
  hMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  metaRating: { fontSize: 11, fontWeight: '600', color: colors.primary },
  metaCity: { fontSize: 11, color: colors.textMuted },
});
