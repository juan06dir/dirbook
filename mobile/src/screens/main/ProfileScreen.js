import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, Image, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getLocals, getMyFollows, getLocal, unfollowLocal } from '../../api';
import { useAuth } from '../../context/AuthContext';
import LocalCard from '../../components/LocalCard';
import { colors, spacing, radius, typography } from '../../theme';
import { API_URL } from '../../api';

function imageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_URL}${path}`;
}

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

export default function ProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('negocios'); // 'negocios' | 'siguiendo'
  const [myLocals, setMyLocals] = useState([]);
  const [followedLocals, setFollowedLocals] = useState([]);
  const [loadingLocals, setLoadingLocals] = useState(false);
  const [loadingFollows, setLoadingFollows] = useState(false);

  useEffect(() => {
    if (user) {
      loadMyLocals();
      loadFollowing();
    }
  }, [user]);

  async function loadMyLocals() {
    setLoadingLocals(true);
    try {
      const data = await getLocals({ my_locals: true });
      setMyLocals(data || []);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoadingLocals(false);
    }
  }

  async function loadFollowing() {
    setLoadingFollows(true);
    try {
      const follows = await getMyFollows();
      if (!follows || follows.length === 0) {
        setFollowedLocals([]);
        return;
      }
      // follows is array of { local_id, ... } — fetch each local
      const locals = await Promise.all(
        follows.map(f => getLocal(f.local_id).catch(() => null))
      );
      setFollowedLocals(locals.filter(Boolean));
    } catch (e) {
      console.warn(e);
    } finally {
      setLoadingFollows(false);
    }
  }

  async function handleUnfollow(localId) {
    // optimistic update
    setFollowedLocals(prev => prev.filter(l => l.id !== localId));
    try {
      await unfollowLocal(localId);
    } catch (e) {
      // revert on failure
      loadFollowing();
      Alert.alert('Error', 'No se pudo dejar de seguir.');
    }
  }

  function handleLogout() {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro que quieres salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Salir', style: 'destructive', onPress: signOut },
      ]
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, styles.guestWrap, { paddingTop: insets.top }]}>
        <LinearGradient colors={['#111111', '#0A0A0A']} style={StyleSheet.absoluteFill} />
        <View style={styles.guestLogoCircle}>
          <Ionicons name="person" size={40} color={colors.primary} />
        </View>
        <Text style={styles.guestTitle}>Inicia sesión</Text>
        <Text style={styles.guestSubtitle}>Para ver tu perfil y gestionar tus negocios</Text>
        <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginBtnText}>Iniciar sesión</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.registerBtn} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerBtnText}>Crear cuenta gratis</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const avatarUri = imageUrl(user.avatar);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <LinearGradient colors={['#151515', '#0A0A0A']} style={[styles.profileHeader, { paddingTop: insets.top + 16 }]}>
        <View style={styles.avatarWrap}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} onError={() => {}} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.initials}>{getInitials(user.name)}</Text>
            </View>
          )}
        </View>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        {user.is_admin && (
          <View style={styles.adminBadge}>
            <Ionicons name="shield-checkmark" size={12} color={colors.primary} />
            <Text style={styles.adminText}>Administrador</Text>
          </View>
        )}
      </LinearGradient>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statNum}>{myLocals.length}</Text>
          <Text style={styles.statLabel}>Negocios</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statNum}>
            {myLocals.reduce((acc, l) => acc + (l?.followers_count || 0), 0)}
          </Text>
          <Text style={styles.statLabel}>Seguidores</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statNum}>{followedLocals.length}</Text>
          <Text style={styles.statLabel}>Siguiendo</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'negocios' && styles.tabActive]}
          onPress={() => setActiveTab('negocios')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="storefront-outline"
            size={16}
            color={activeTab === 'negocios' ? colors.primary : colors.textMuted}
          />
          <Text style={[styles.tabText, activeTab === 'negocios' && styles.tabTextActive]}>
            Mis negocios
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'siguiendo' && styles.tabActive]}
          onPress={() => setActiveTab('siguiendo')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="heart-outline"
            size={16}
            color={activeTab === 'siguiendo' ? colors.primary : colors.textMuted}
          />
          <Text style={[styles.tabText, activeTab === 'siguiendo' && styles.tabTextActive]}>
            Siguiendo
          </Text>
          {followedLocals.length > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{followedLocals.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Tab content */}
      {activeTab === 'negocios' ? (
        <View style={styles.section}>
          {loadingLocals ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
          ) : myLocals.length > 0 ? (
            <View style={{ paddingHorizontal: spacing.lg }}>
              {myLocals.map((l) => (
                <LocalCard
                  key={String(l.id)}
                  local={l}
                  onPress={() => navigation.navigate('LocalDetalle', { local: l })}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyWrap}>
              <Ionicons name="storefront-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>Sin negocios</Text>
              <Text style={styles.emptyText}>Aún no tienes negocios registrados</Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.section}>
          {loadingFollows ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
          ) : followedLocals.length > 0 ? (
            <View style={{ paddingHorizontal: spacing.lg }}>
              {followedLocals.map((l) => (
                <LocalCard
                  key={String(l.id)}
                  local={l}
                  onPress={() => navigation.navigate('LocalDetalle', { local: l })}
                  showFollow
                  following
                  onFollow={() => handleUnfollow(l.id)}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyWrap}>
              <Ionicons name="heart-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>Sin seguidos</Text>
              <Text style={styles.emptyText}>Explora negocios y síguelos para verlos aquí</Text>
              <TouchableOpacity
                style={styles.exploreBtn}
                onPress={() => navigation.navigate('Explorar')}
                activeOpacity={0.8}
              >
                <Text style={styles.exploreBtnText}>Explorar negocios</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Menu */}
      <View style={styles.menuSection}>
        {[
          { icon: 'settings-outline', label: 'Configuración', onPress: () => {} },
          { icon: 'help-circle-outline', label: 'Ayuda', onPress: () => {} },
          { icon: 'log-out-outline', label: 'Cerrar sesión', onPress: handleLogout, danger: true },
        ].map((item) => (
          <TouchableOpacity
            key={item.label}
            style={styles.menuItem}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <Ionicons name={item.icon} size={20} color={item.danger ? colors.error : colors.textSecondary} />
            <Text style={[styles.menuLabel, item.danger && styles.menuDanger]}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  profileHeader: { alignItems: 'center', paddingBottom: spacing.xl, paddingHorizontal: spacing.lg },
  avatarWrap: { marginBottom: spacing.md },
  avatar: { width: 88, height: 88, borderRadius: 44, borderWidth: 3, borderColor: colors.primary },
  avatarPlaceholder: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: colors.primaryFaded,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: colors.primary,
  },
  initials: { fontSize: 32, fontWeight: '800', color: colors.primary },
  userName: { ...typography.h2, marginBottom: 4 },
  userEmail: { fontSize: 14, color: colors.textMuted },
  adminBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginTop: spacing.sm,
    backgroundColor: colors.primaryFaded,
    paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.primary + '44',
  },
  adminText: { fontSize: 12, fontWeight: '700', color: colors.primary },

  statsRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    borderRadius: radius.xl,
    paddingVertical: spacing.lg,
    marginTop: -20,
    borderWidth: 1, borderColor: colors.border,
  },
  stat: { alignItems: 'center' },
  statNum: { fontSize: 24, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: colors.border },

  // Tabs
  tabs: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  tabActive: {
    backgroundColor: colors.surface2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.primary,
  },
  tabBadge: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.bg,
  },

  section: { marginTop: spacing.lg },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 1.5,
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: { ...typography.h3, marginTop: spacing.sm },
  emptyText: { fontSize: 14, color: colors.textMuted, textAlign: 'center' },
  exploreBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: 12,
    borderRadius: radius.full,
  },
  exploreBtnText: { fontSize: 14, fontWeight: '800', color: colors.bg },

  menuSection: {
    marginTop: spacing.xl,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingVertical: spacing.md, paddingHorizontal: spacing.lg,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  menuLabel: { flex: 1, fontSize: 15, color: colors.text },
  menuDanger: { color: colors.error },

  // Guest styles
  guestWrap: { justifyContent: 'center', alignItems: 'center', padding: spacing.xl, gap: spacing.lg },
  guestLogoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.primaryFaded,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: colors.primary,
  },
  guestTitle: { ...typography.h2 },
  guestSubtitle: { fontSize: 14, color: colors.textMuted, textAlign: 'center' },
  loginBtn: {
    width: '100%', backgroundColor: colors.primary,
    paddingVertical: 14, borderRadius: radius.full,
    alignItems: 'center',
  },
  loginBtnText: { fontSize: 16, fontWeight: '800', color: '#000' },
  registerBtn: {
    width: '100%', borderWidth: 1, borderColor: colors.border,
    paddingVertical: 14, borderRadius: radius.full, alignItems: 'center',
  },
  registerBtnText: { fontSize: 15, fontWeight: '600', color: colors.text },
});
