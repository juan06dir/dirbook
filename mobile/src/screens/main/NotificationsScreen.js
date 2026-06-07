import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getNotifications, markNotificationsRead } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, radius, typography } from '../../theme';

const NOTIF_ICONS = {
  follow: { icon: 'heart', color: '#EF4444' },
  rating: { icon: 'star', color: '#FACC15' },
  comment: { icon: 'chatbubble', color: '#3B82F6' },
  default: { icon: 'notifications', color: colors.textMuted },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `hace ${days}d`;
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    loadNotifications();
  }, [user]);

  async function loadNotifications() {
    try {
      const data = await getNotifications();
      setNotifications(data || []);
      await markNotificationsRead();
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <Ionicons name="notifications-off-outline" size={56} color={colors.textMuted} />
        <Text style={styles.emptyTitle}>Inicia sesión</Text>
        <Text style={styles.emptySubtext}>para ver tus notificaciones</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const renderItem = ({ item }) => {
    const cfg = NOTIF_ICONS[item.notif_type] || NOTIF_ICONS.default;
    return (
      <View style={[styles.item, !item.is_read && styles.unread]}>
        <View style={[styles.iconWrap, { backgroundColor: cfg.color + '22' }]}>
          <Ionicons name={cfg.icon} size={20} color={cfg.color} />
        </View>
        <View style={styles.itemContent}>
          <Text style={styles.message}>{item.message}</Text>
          {item.local_name && (
            <Text style={styles.localName}>{item.local_name}</Text>
          )}
          <Text style={styles.time}>{timeAgo(item.created_at)}</Text>
        </View>
        {!item.is_read && <View style={styles.unreadDot} />}
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Notificaciones</Text>
      </View>
      <FlatList
        data={notifications}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons name="notifications-outline" size={56} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Sin notificaciones</Text>
            <Text style={styles.emptySubtext}>Cuando alguien te siga o califique, aparecerá aquí</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.sm, padding: spacing.xl },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.lg },
  title: { ...typography.h2 },
  item: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
    gap: spacing.md,
  },
  unread: { backgroundColor: colors.primaryFaded },
  iconWrap: {
    width: 40, height: 40, borderRadius: radius.full,
    justifyContent: 'center', alignItems: 'center',
  },
  itemContent: { flex: 1 },
  message: { fontSize: 14, color: colors.text, lineHeight: 19 },
  localName: { fontSize: 12, color: colors.primary, fontWeight: '600', marginTop: 2 },
  time: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  unreadDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 6,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.textMuted },
  emptySubtext: { fontSize: 13, color: colors.textMuted, textAlign: 'center' },
});
