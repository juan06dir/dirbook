import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, shadow } from '../theme';
import { API_URL } from '../api';

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

  // ── Horizontal (carousel) variant — Airbnb style big image ───────────────
  if (horizontal) {
    return (
      <TouchableOpacity
        style={[styles.hCard, shadow.md]}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <View style={styles.hCover}>
          {coverUri ? (
            <Image source={{ uri: coverUri }} style={styles.coverImg} />
          ) : logoUri ? (
            <Image source={{ uri: logoUri }} style={styles.coverImg} />
          ) : (
            <View style={styles.coverPlaceholder}>
              <Ionicons name={categoryIcon} size={40} color={colors.primary} style={{ opacity: 0.5 }} />
            </View>
          )}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.45)', 'rgba(0,0,0,0.88)']}
            style={styles.coverGradient}
          />

          {/* Rating badge */}
          {rating > 0 && (
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={11} color={colors.primary} />
              <Text style={styles.ratingBadgeText}>{rating.toFixed(1)}</Text>
            </View>
          )}

          {/* Category chip */}
          {local.category ? (
            <View style={styles.categoryChip}>
              <Text style={styles.categoryChipText}>{local.category}</Text>
            </View>
          ) : null}

          {/* Name overlaid */}
          <View style={styles.hOverlayInfo}>
            <Text style={styles.hOverlayName} numberOfLines={1}>{local.name}</Text>
            {local.city ? (
              <View style={styles.overlayMetaRow}>
                <Ionicons name="location" size={11} color="rgba(255,255,255,0.85)" />
                <Text style={styles.overlayMetaText} numberOfLines={1}>{local.city}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // ── Vertical (full) variant — image-forward Airbnb style ─────────────────
  return (
    <TouchableOpacity
      style={[styles.card, shadow.md]}
      onPress={onPress}
      activeOpacity={0.92}
    >
      {/* Cover image with overlay */}
      <View style={styles.cover}>
        {coverUri ? (
          <Image source={{ uri: coverUri }} style={styles.coverImg} />
        ) : (
          <View style={styles.coverPlaceholder}>
            <Ionicons name={categoryIcon} size={48} color={colors.primary} style={{ opacity: 0.5 }} />
          </View>
        )}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.85)']}
          style={styles.coverGradient}
        />

        {/* Category chip — top-left, gold */}
        {local.category ? (
          <View style={styles.categoryChip}>
            <Text style={styles.categoryChipText}>{local.category}</Text>
          </View>
        ) : null}

        {/* Rating badge — top-right */}
        {rating > 0 && (
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color={colors.primary} />
            <Text style={styles.ratingBadgeText}>
              {rating.toFixed(1)}
              {local.ratings_count > 0 ? `  (${local.ratings_count})` : ''}
            </Text>
          </View>
        )}

        {/* Name + city overlaid on gradient */}
        <View style={styles.overlayInfo}>
          <View style={styles.overlayNameRow}>
            <View style={styles.logoWrap}>
              {logoUri ? (
                <Image source={{ uri: logoUri }} style={styles.logoImg} />
              ) : (
                <View style={styles.logoPlaceholder}>
                  <Ionicons name={categoryIcon} size={16} color={colors.primary} />
                </View>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.overlayName} numberOfLines={1}>{local.name}</Text>
              {local.city ? (
                <View style={styles.overlayMetaRow}>
                  <Ionicons name="location" size={11} color="rgba(255,255,255,0.85)" />
                  <Text style={styles.overlayMetaText}>{local.city}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>
      </View>

      {/* Card body */}
      <View style={styles.body}>
        {local.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {local.description}
          </Text>
        ) : null}

        <View style={styles.actionRow}>
          <View style={styles.likesWrap}>
            <Ionicons name="heart" size={15} color={colors.error} />
            <Text style={styles.likesText}>
              {formatCount(local.followers_count)} seguidores
            </Text>
          </View>

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
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },

  cover: {
    height: 210,
    backgroundColor: colors.surface2,
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
    backgroundColor: colors.surface2,
  },
  coverGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '65%',
  },

  // Gold category chip — top-left
  categoryChip: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  categoryChipText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  // Rating badge — top-right
  ratingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  ratingBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },

  // Overlaid info on gradient
  overlayInfo: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.md,
  },
  overlayNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoWrap: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(250,204,21,0.7)',
    backgroundColor: colors.surface2,
  },
  logoImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  logoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.3,
  },
  overlayMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 1,
  },
  overlayMetaText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
  },

  // Body
  body: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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

  // ── Horizontal (carousel) card ──
  hCard: {
    width: 270,
    marginRight: spacing.md,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hCover: {
    height: 170,
    backgroundColor: colors.surface2,
  },
  hOverlayInfo: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.md,
  },
  hOverlayName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.2,
  },
});
