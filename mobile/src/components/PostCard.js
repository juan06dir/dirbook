import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, radius, spacing } from '../theme';
import { API_URL, likePost, unlikePost, deletePost } from '../api';
import { useAuth } from '../context/AuthContext';
import CommentsModal from './CommentsModal';

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

function initials(name) {
  if (!name) return '?';
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
}

export default function PostCard({ post: initialPost }) {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [post, setPost] = useState(initialPost);
  const [removed, setRemoved] = useState(false);

  const config = TYPE_CONFIG[post.post_type] || TYPE_CONFIG.post;
  const imgUri = imageUrl(post.image_url);
  const isExpired = post.event_end && new Date(post.event_end) < new Date();

  // Autor: local o profesional
  const isLocal = !!post.local_id;
  const authorName = isLocal ? post.local_name : post.professional_name;
  const authorSub = isLocal
    ? [post.local_category, post.local_city].filter(Boolean).join(' · ')
    : post.professional_profession;
  const authorImg = imageUrl(isLocal ? post.local_logo : post.professional_avatar);

  // ¿El usuario es el dueño de esta publicación?
  const isOwner =
    !!user &&
    ((post.local_owner_id && post.local_owner_id === user.id) ||
      (post.professional_owner_id && post.professional_owner_id === user.id));

  function goToAuthor() {
    if (isLocal && post.local_id) {
      navigation.navigate('LocalDetalle', {
        local: {
          id: post.local_id,
          name: post.local_name,
          logo_url: post.local_logo,
          category: post.local_category,
          city: post.local_city,
        },
      });
    } else if (post.professional_id) {
      navigation.navigate('ProfesionalDetalle', {
        professional: {
          id: post.professional_id,
          name: post.professional_name,
          profession: post.professional_profession,
          avatar_url: post.professional_avatar,
        },
      });
    }
  }

  function handleEdit() {
    navigation.navigate('CrearPublicacion', {
      post,
      onSaved: (updated) => setPost(updated),
    });
  }

  function handleDelete() {
    Alert.alert('Eliminar publicación', '¿Seguro que quieres eliminarla? Esta acción no se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePost(post.id);
            setRemoved(true);
          } catch (e) {
            Alert.alert('Error', e.message || 'No se pudo eliminar.');
          }
        },
      },
    ]);
  }

  const [liked, setLiked] = useState(!!initialPost.liked_by_me);
  const [likesCount, setLikesCount] = useState(initialPost.likes_count || 0);
  const [commentsCount, setCommentsCount] = useState(initialPost.comments_count || 0);
  const [busy, setBusy] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);

  function requireAuth() {
    Alert.alert('Inicia sesión', 'Crea una cuenta gratis para dar me gusta y comentar.', [
      { text: 'Ahora no', style: 'cancel' },
      { text: 'Crear cuenta', onPress: () => navigation.navigate('Register') },
    ]);
  }

  async function toggleLike() {
    if (!user) { requireAuth(); return; }
    if (busy) return;
    const next = !liked;
    setLiked(next);
    setLikesCount((c) => c + (next ? 1 : -1));
    setBusy(true);
    try {
      const res = next ? await likePost(post.id) : await unlikePost(post.id);
      if (res && typeof res.likes_count === 'number') {
        setLiked(res.liked);
        setLikesCount(res.likes_count);
      }
    } catch (e) {
      // revertir
      setLiked(!next);
      setLikesCount((c) => c + (next ? -1 : 1));
    } finally {
      setBusy(false);
    }
  }

  function openComments() {
    if (!user) { requireAuth(); return; }
    setCommentsOpen(true);
  }

  if (removed) return null;

  return (
    <View style={[styles.card, isExpired && styles.expired]}>
      {/* Autor */}
      <View style={styles.authorRow}>
        <TouchableOpacity style={styles.authorTap} onPress={goToAuthor} activeOpacity={0.7}>
          {authorImg ? (
            <Image source={{ uri: authorImg }} style={styles.authorImg} />
          ) : (
            <View style={styles.authorPlaceholder}>
              <Text style={styles.authorInitials}>{initials(authorName)}</Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.authorName} numberOfLines={1}>{authorName || 'Dirbook'}</Text>
            {!!authorSub && <Text style={styles.authorSub} numberOfLines={1}>{authorSub}</Text>}
          </View>
        </TouchableOpacity>
        <View style={[styles.typeBadge, { backgroundColor: config.color + '22', borderColor: config.color + '44' }]}>
          <Ionicons name={config.icon} size={11} color={config.color} />
          <Text style={[styles.typeText, { color: config.color }]}>{config.label}</Text>
        </View>
      </View>

      {imgUri && (
        <TouchableOpacity onPress={goToAuthor} activeOpacity={0.9}>
          <Image source={{ uri: imgUri }} style={styles.image} />
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.body} onPress={goToAuthor} activeOpacity={0.7}>
        {(isExpired || post.discount_pct > 0) && (
          <View style={styles.header}>
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
        )}
        {!!post.title && <Text style={styles.title} numberOfLines={2}>{post.title}</Text>}
        {!!post.content && <Text style={styles.content} numberOfLines={4}>{post.content}</Text>}
        {(post.event_start || post.event_end) && (
          <View style={styles.dates}>
            <Ionicons name="calendar-outline" size={12} color={colors.textMuted} />
            <Text style={styles.dateText}>
              {formatDate(post.event_start)}
              {post.event_end && ` → ${formatDate(post.event_end)}`}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Barra social */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={toggleLike} activeOpacity={0.7}>
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={22}
            color={liked ? colors.error : colors.textSecondary}
          />
          {likesCount > 0 && <Text style={[styles.actionText, liked && { color: colors.error }]}>{likesCount}</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={openComments} activeOpacity={0.7}>
          <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />
          {commentsCount > 0 && <Text style={styles.actionText}>{commentsCount}</Text>}
          {commentsCount === 0 && <Text style={styles.actionText}>Comentar</Text>}
        </TouchableOpacity>

        {isOwner && (
          <View style={styles.ownerActions}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleEdit} activeOpacity={0.7}>
              <Ionicons name="create-outline" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={handleDelete} activeOpacity={0.7}>
              <Ionicons name="trash-outline" size={19} color={colors.error} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <CommentsModal
        visible={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        postId={post.id}
        onCountChange={setCommentsCount}
      />
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

  authorRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
  },
  authorTap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  authorImg: { width: 38, height: 38, borderRadius: 19 },
  authorPlaceholder: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: colors.primaryFaded,
    justifyContent: 'center', alignItems: 'center',
  },
  authorInitials: { fontSize: 14, fontWeight: '800', color: colors.primary },
  authorName: { fontSize: 14, fontWeight: '700', color: colors.text },
  authorSub: { fontSize: 12, color: colors.textMuted, marginTop: 1 },

  image: { width: '100%', height: 200, resizeMode: 'cover' },
  body: { paddingHorizontal: spacing.md, paddingTop: spacing.sm },
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
  dates: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  dateText: { fontSize: 12, color: colors.textMuted },

  actions: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.lg,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    marginTop: spacing.xs,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  ownerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginLeft: 'auto' },
});
