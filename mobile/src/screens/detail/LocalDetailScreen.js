import React, { useState, useEffect } from 'react';
import {
  View, Text, Image, TouchableOpacity, ScrollView, StyleSheet,
  Linking, ActivityIndicator, Alert, TextInput, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getLocal, getLocalPosts, getLocalRatings,
  followLocal, unfollowLocal, getMyFollows, rateLocal,
} from '../../api';
import { useAuth } from '../../context/AuthContext';
import PostCard from '../../components/PostCard';
import StarRating from '../../components/StarRating';
import { colors, spacing, radius, typography, shadow } from '../../theme';
import { API_URL } from '../../api';

function imageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_URL}${path}`;
}

export default function LocalDetailScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { local: initialLocal } = route.params;
  const [local, setLocal] = useState(initialLocal);
  const [posts, setPosts] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('info');
  // Rating modal
  const [showRating, setShowRating] = useState(false);
  const [myScore, setMyScore] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [ratingLoading, setRatingLoading] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      const [fresh, postsData, ratingsData] = await Promise.all([
        getLocal(initialLocal.id),
        getLocalPosts(initialLocal.id),
        getLocalRatings(initialLocal.id),
      ]);
      setLocal(fresh);
      setPosts(postsData || []);
      setRatings(ratingsData || []);

      if (user) {
        const follows = await getMyFollows();
        setIsFollowing((follows || []).some(f => f.local_id === initialLocal.id));
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  }

  async function toggleFollow() {
    if (!user) { navigation.navigate('Login'); return; }
    try {
      if (isFollowing) {
        await unfollowLocal(local.id);
      } else {
        await followLocal(local.id);
      }
      setIsFollowing(v => !v);
      setLocal(prev => ({
        ...prev,
        followers_count: (prev.followers_count || 0) + (isFollowing ? -1 : 1),
      }));
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  }

  async function submitRating() {
    if (!myScore) { Alert.alert('Selecciona una calificación'); return; }
    setRatingLoading(true);
    try {
      await rateLocal(local.id, myScore, myComment);
      setShowRating(false);
      setMyScore(0);
      setMyComment('');
      const updatedRatings = await getLocalRatings(local.id);
      setRatings(updatedRatings || []);
      const fresh = await getLocal(local.id);
      setLocal(fresh);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setRatingLoading(false);
    }
  }

  function openLink(url) {
    if (!url) return;
    const full = url.startsWith('http') ? url : `https://${url}`;
    Linking.openURL(full).catch(() => {});
  }

  const coverUri = imageUrl(local.cover_image);
  const logoUri = imageUrl(local.logo);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Cover */}
        <View style={styles.coverWrap}>
          {coverUri ? (
            <Image source={{ uri: coverUri }} style={styles.cover} />
          ) : (
            <View style={[styles.cover, styles.coverPlaceholder]}>
              <Ionicons name="storefront" size={60} color={colors.textMuted} />
            </View>
          )}
          <LinearGradient colors={['transparent', 'rgba(10,10,10,0.95)']} style={styles.coverGradient} />
          <TouchableOpacity
            style={[styles.backBtn, { top: insets.top + 12 }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Info header */}
        <View style={styles.infoHeader}>
          <View style={styles.logoNameRow}>
            <View style={styles.logoWrap}>
              {logoUri ? (
                <Image source={{ uri: logoUri }} style={styles.logo} />
              ) : (
                <View style={styles.logoPlaceholder}>
                  <Ionicons name="storefront" size={24} color={colors.primary} />
                </View>
              )}
            </View>
            <View style={styles.nameBlock}>
              <Text style={styles.name}>{local.name}</Text>
              {local.category && <Text style={styles.category}>{local.category}</Text>}
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            {local.avg_rating > 0 && (
              <View style={styles.statItem}>
                <Ionicons name="star" size={14} color={colors.primary} />
                <Text style={styles.statText}>{local.avg_rating.toFixed(1)}</Text>
                <Text style={styles.statMuted}>({local.ratings_count})</Text>
              </View>
            )}
            <View style={styles.statItem}>
              <Ionicons name="heart" size={14} color={colors.error} />
              <Text style={styles.statText}>{local.followers_count || 0}</Text>
            </View>
            {local.city && (
              <View style={styles.statItem}>
                <Ionicons name="location-outline" size={14} color={colors.textMuted} />
                <Text style={styles.statText}>{local.city}</Text>
              </View>
            )}
          </View>

          {/* Action buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, isFollowing && styles.actionBtnActive]}
              onPress={toggleFollow}
              activeOpacity={0.8}
            >
              <Ionicons name={isFollowing ? 'heart' : 'heart-outline'} size={16} color={isFollowing ? colors.error : colors.text} />
              <Text style={[styles.actionBtnText, isFollowing && { color: colors.error }]}>
                {isFollowing ? 'Siguiendo' : 'Seguir'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnPrimary]}
              onPress={() => user ? setShowRating(true) : navigation.navigate('Login')}
              activeOpacity={0.8}
            >
              <Ionicons name="star-outline" size={16} color="#000" />
              <Text style={styles.actionBtnPrimaryText}>Calificar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {[
            { key: 'info', label: 'Info' },
            { key: 'posts', label: `Posts (${posts.length})` },
            { key: 'ratings', label: `Reseñas (${ratings.length})` },
          ].map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[styles.tab, tab === t.key && styles.tabActive]}
              onPress={() => setTab(t.key)}
            >
              <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab content */}
        <View style={styles.tabContent}>
          {tab === 'info' && (
            <>
              {local.description && (
                <View style={styles.block}>
                  <Text style={styles.blockTitle}>Descripción</Text>
                  <Text style={styles.bodyText}>{local.description}</Text>
                </View>
              )}
              {local.address && (
                <View style={styles.block}>
                  <Text style={styles.blockTitle}>Dirección</Text>
                  <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={16} color={colors.textMuted} />
                    <Text style={styles.infoText}>{local.address}</Text>
                  </View>
                </View>
              )}
              {/* Contact */}
              <View style={styles.block}>
                <Text style={styles.blockTitle}>Contacto</Text>
                {local.phone && (
                  <TouchableOpacity style={styles.infoRow} onPress={() => Linking.openURL(`tel:${local.phone}`)}>
                    <Ionicons name="call-outline" size={16} color={colors.primary} />
                    <Text style={[styles.infoText, { color: colors.primary }]}>{local.phone}</Text>
                  </TouchableOpacity>
                )}
                {local.website && (
                  <TouchableOpacity style={styles.infoRow} onPress={() => openLink(local.website)}>
                    <Ionicons name="globe-outline" size={16} color={colors.info} />
                    <Text style={[styles.infoText, { color: colors.info }]}>{local.website}</Text>
                  </TouchableOpacity>
                )}
              </View>
              {/* Social */}
              {(local.whatsapp || local.facebook || local.instagram) && (
                <View style={styles.block}>
                  <Text style={styles.blockTitle}>Redes sociales</Text>
                  <View style={styles.socialRow}>
                    {local.whatsapp && (
                      <TouchableOpacity
                        style={[styles.socialBtn, { backgroundColor: '#25D36622' }]}
                        onPress={() => Linking.openURL(`https://wa.me/${local.whatsapp.replace(/\D/g, '')}`)}
                      >
                        <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
                      </TouchableOpacity>
                    )}
                    {local.facebook && (
                      <TouchableOpacity
                        style={[styles.socialBtn, { backgroundColor: '#1877F222' }]}
                        onPress={() => openLink(local.facebook)}
                      >
                        <Ionicons name="logo-facebook" size={22} color="#1877F2" />
                      </TouchableOpacity>
                    )}
                    {local.instagram && (
                      <TouchableOpacity
                        style={[styles.socialBtn, { backgroundColor: '#E4405F22' }]}
                        onPress={() => openLink(local.instagram)}
                      >
                        <Ionicons name="logo-instagram" size={22} color="#E4405F" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
            </>
          )}

          {tab === 'posts' && (
            posts.length > 0
              ? posts.map((p) => <PostCard key={p.id} post={p} />)
              : <View style={styles.emptyTab}>
                  <Ionicons name="newspaper-outline" size={36} color={colors.textMuted} />
                  <Text style={styles.emptyTabText}>Sin publicaciones todavía</Text>
                </View>
          )}

          {tab === 'ratings' && (
            ratings.length > 0
              ? ratings.map((r) => (
                  <View key={r.id} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      <View style={styles.reviewAvatar}>
                        <Text style={styles.reviewAvatarText}>
                          {r.user_name?.[0]?.toUpperCase() || '?'}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.reviewName}>{r.user_name || 'Usuario'}</Text>
                        <StarRating value={r.score} readonly size={14} />
                      </View>
                    </View>
                    {r.comment && <Text style={styles.reviewComment}>{r.comment}</Text>}
                  </View>
                ))
              : <View style={styles.emptyTab}>
                  <Ionicons name="star-outline" size={36} color={colors.textMuted} />
                  <Text style={styles.emptyTabText}>Sin reseñas todavía</Text>
                </View>
          )}
        </View>
      </ScrollView>

      {/* Rating Modal */}
      <Modal visible={showRating} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Calificar {local.name}</Text>
            <View style={styles.modalStars}>
              <StarRating value={myScore} onChange={setMyScore} size={36} />
            </View>
            <TextInput
              style={styles.commentInput}
              placeholder="Deja un comentario (opcional)"
              placeholderTextColor={colors.textMuted}
              value={myComment}
              onChangeText={setMyComment}
              multiline
              numberOfLines={3}
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowRating(false)}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={submitRating} disabled={ratingLoading}>
                {ratingLoading ? <ActivityIndicator color="#000" size="small" /> : <Text style={styles.submitBtnText}>Enviar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  coverWrap: { height: 260, position: 'relative' },
  cover: { width: '100%', height: '100%' },
  coverPlaceholder: { backgroundColor: colors.surface2, justifyContent: 'center', alignItems: 'center' },
  coverGradient: { ...StyleSheet.absoluteFillObject },
  backBtn: {
    position: 'absolute', left: 16,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', alignItems: 'center',
  },
  infoHeader: { padding: spacing.lg, marginTop: -20 },
  logoNameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  logoWrap: { width: 60, height: 60, borderRadius: radius.lg, overflow: 'hidden', marginRight: spacing.md, borderWidth: 2, borderColor: colors.surface },
  logo: { width: '100%', height: '100%', resizeMode: 'cover' },
  logoPlaceholder: { width: '100%', height: '100%', backgroundColor: colors.surface2, justifyContent: 'center', alignItems: 'center' },
  nameBlock: { flex: 1 },
  name: { ...typography.h2 },
  category: { fontSize: 13, color: colors.primary, fontWeight: '600', marginTop: 2 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 13, fontWeight: '600', color: colors.text },
  statMuted: { fontSize: 12, color: colors.textMuted },
  actionRow: { flexDirection: 'row', gap: spacing.sm },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 12, borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  actionBtnActive: { borderColor: colors.error + '44', backgroundColor: colors.error + '11' },
  actionBtnText: { fontSize: 14, fontWeight: '600', color: colors.text },
  actionBtnPrimary: { backgroundColor: colors.primary, borderColor: colors.primary },
  actionBtnPrimaryText: { fontSize: 14, fontWeight: '700', color: '#000' },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border, marginHorizontal: spacing.lg },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  tabTextActive: { color: colors.primary },
  tabContent: { padding: spacing.lg },
  block: { marginBottom: spacing.lg },
  blockTitle: { fontSize: 13, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: spacing.sm },
  bodyText: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 6 },
  infoText: { fontSize: 14, color: colors.textSecondary },
  socialRow: { flexDirection: 'row', gap: spacing.sm },
  socialBtn: { width: 48, height: 48, borderRadius: radius.md, justifyContent: 'center', alignItems: 'center' },
  emptyTab: { alignItems: 'center', paddingVertical: 40, gap: spacing.sm },
  emptyTabText: { fontSize: 14, color: colors.textMuted },
  reviewCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  reviewAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.primaryFaded,
    justifyContent: 'center', alignItems: 'center',
  },
  reviewAvatarText: { fontSize: 14, fontWeight: '700', color: colors.primary },
  reviewName: { fontSize: 14, fontWeight: '600', color: colors.text },
  reviewComment: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modal: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl,
    padding: spacing.xl, paddingBottom: 40,
  },
  modalTitle: { ...typography.h3, textAlign: 'center', marginBottom: spacing.lg },
  modalStars: { alignItems: 'center', marginBottom: spacing.lg },
  commentInput: {
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.md,
    color: colors.text,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: spacing.lg,
  },
  modalBtns: { flexDirection: 'row', gap: spacing.md },
  cancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center',
  },
  cancelBtnText: { fontSize: 15, color: colors.textSecondary, fontWeight: '600' },
  submitBtn: {
    flex: 1, paddingVertical: 14, borderRadius: radius.full,
    backgroundColor: colors.primary, alignItems: 'center',
  },
  submitBtnText: { fontSize: 15, color: '#000', fontWeight: '800' },
});
