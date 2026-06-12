import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../theme';
import { API_URL } from '../api';

const TYPE_CONFIG = {
  post: { label: 'Post', color: colors.info, icon: 'newspaper' },
  event: { label: 'Evento', color: colors.success, icon: 'calendar' },
  discount: { label: 'Descuento', color: colors.warning, icon: 'pricetag' },
};

function imageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_URL}${path}`;
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
}

export default function PostCard({ post }) {
  const config = TYPE_CONFIG[post.post_type] || TYPE_CONFIG.post;
  const imgUri = imageUrl(post.image_url);
  const isExpired = post.event_end && new Date(post.event_end) < new Date();

  return (
    <View style={[styles.card, isExpired && styles.expired]}>
      {imgUri && <Image source={{ uri: imgUri }} style={styles.image} />}
      <View style={styles.body}>
        <View style={styles.header}>
          <View style={[styles.typeBadge, { backgroundColor: config.color + '22', borderColor: config.color + '44' }]}>
            <Ionicons name={config.icon} size={11} color={config.color} />
            <Text style={[styles.typeText, { color: config.color }]}>{config.label}</Text>
          </View>
          {isExpired && (
            <View style={styles.expiredBadge}>
              <Text style={styles.expiredText}>Expirado</Text>
            </View>
          )}
          {post.discount_pct > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{post.discount_pct}%</Text>
            </View>
          )}
        </View>
        <Text style={styles.title} numberOfLines={2}>{post.title}</Text>
        {post.content && (
          <Text style={styles.content} numberOfLines={3}>{post.content}</Text>
        )}
        {(post.event_start || post.event_end) && (
          <View style={styles.dates}>
            <Ionicons name="calendar-outline" size={12} color={colors.textMuted} />
            <Text style={styles.dateText}>
              {formatDate(post.event_start)}
              {post.event_end && ` → ${formatDate(post.event_end)}`}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  expired: { opacity: 0.5 },
  image: { width: '100%', height: 180, resizeMode: 'cover' },
  body: { padding: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  typeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: radius.full, borderWidth: 1,
  },
  typeText: { fontSize: 11, fontWeight: '600' },
  expiredBadge: {
    backgroundColor: colors.surface3,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: radius.full,
  },
  expiredText: { fontSize: 10, color: colors.textMuted, fontWeight: '600' },
  discountBadge: {
    backgroundColor: colors.warning + '22',
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.warning + '44',
  },
  discountText: { fontSize: 12, fontWeight: '800', color: colors.warning },
  title: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 4 },
  content: { fontSize: 13, color: colors.textSecondary, lineHeight: 18, marginBottom: 6 },
  dates: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateText: { fontSize: 12, color: colors.textMuted },
});
