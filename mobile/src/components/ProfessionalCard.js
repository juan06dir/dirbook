import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, shadow } from '../theme';
import { API_URL } from '../api';

function imageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_URL}${path}`;
}

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

export default function ProfessionalCard({ professional, onPress }) {
  const avatarUri = imageUrl(professional.avatar);
  const rating = professional.avg_rating ? professional.avg_rating.toFixed(1) : null;

  return (
    <TouchableOpacity style={[styles.card, shadow.sm]} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.avatarWrap}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatar} onError={() => {}} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.initials}>{getInitials(professional.name)}</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{professional.name}</Text>
        <Text style={styles.profession} numberOfLines={1}>{professional.profession}</Text>
        {professional.bio && (
          <Text style={styles.bio} numberOfLines={2}>{professional.bio}</Text>
        )}
        <View style={styles.footer}>
          {rating && (
            <View style={styles.ratingPill}>
              <Ionicons name="star" size={11} color={colors.primary} />
              <Text style={styles.ratingText}>{rating}</Text>
            </View>
          )}
          {professional.city && (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={11} color={colors.textMuted} />
              <Text style={styles.location}>{professional.city}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'flex-start',
  },
  avatarWrap: {
    marginRight: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryFaded,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  initials: { fontSize: 18, fontWeight: '800', color: colors.primary },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 2 },
  profession: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bio: { fontSize: 13, color: colors.textSecondary, lineHeight: 17, marginBottom: spacing.sm },
  footer: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  ratingPill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: colors.primaryFaded,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: radius.full,
  },
  ratingText: { fontSize: 11, fontWeight: '700', color: colors.primary },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  location: { fontSize: 11, color: colors.textMuted },
});
