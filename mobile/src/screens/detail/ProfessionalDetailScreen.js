import React, { useState, useEffect } from 'react';
import {
  View, Text, Image, TouchableOpacity, ScrollView,
  StyleSheet, Linking, Alert, TextInput, Modal, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getProfessional, getProfessionalRatings, getProfessionalPosts, rateProfessional } from '../../api';
import { useAuth } from '../../context/AuthContext';
import StarRating from '../../components/StarRating';
import PostCard from '../../components/PostCard';
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

export default function ProfessionalDetailScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { professional: initial } = route.params;
  const [prof, setProf] = useState(initial);
  const [ratings, setRatings] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRating, setShowRating] = useState(false);
  const [myScore, setMyScore] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [ratingLoading, setRatingLoading] = useState(false);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    try {
      const [fresh, r, p] = await Promise.all([
        getProfessional(initial.id),
        getProfessionalRatings(initial.id),
        getProfessionalPosts(initial.id),
      ]);
      setProf(fresh);
      setRatings(r || []);
      setPosts(p || []);
    } catch (e) { console.warn(e); }
    finally { setLoading(false); }
  }

  async function submitRating() {
    if (!myScore) { Alert.alert('Selecciona una calificación'); return; }
    setRatingLoading(true);
    try {
      await rateProfessional(prof.id, myScore, myComment);
      setShowRating(false);
      setMyScore(0); setMyComment('');
      const r = await getProfessionalRatings(prof.id);
      setRatings(r || []);
      const fresh = await getProfessional(prof.id);
      setProf(fresh);
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setRatingLoading(false); }
  }

  function openLink(url) {
    if (!url) return;
    const full = url.startsWith('http') ? url : `https://${url}`;
    Linking.openURL(full).catch(() => {});
  }

  const avatarUri = imageUrl(prof.avatar);
  const coverUri = imageUrl(prof.cover_image);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Cover */}
        <View style={styles.coverWrap}>
          {coverUri ? (
            <Image source={{ uri: coverUri }} style={styles.cover} onError={() => {}} />
          ) : (
            <LinearGradient colors={[colors.primaryFaded, '#0A0A0A']} style={styles.cover} />
          )}
          <LinearGradient colors={['transparent', 'rgba(10,10,10,0.95)']} style={StyleSheet.absoluteFill} />
          <TouchableOpacity
            style={[styles.backBtn, { top: insets.top + 12 }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Profile */}
        <View style={styles.profile}>
          <View style={styles.avatarWrap}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} onError={() => {}} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.initials}>{getInitials(prof.name)}</Text>
              </View>
            )}
          </View>
          <Text style={styles.name}>{prof.name}</Text>
          <Text style={styles.profession}>{prof.profession}</Text>

          {!user && (
            <View style={styles.gate}>
              <View style={styles.gateIcon}>
                <Ionicons name="lock-closed" size={26} color={colors.primary} />
              </View>
              <Text style={styles.gateTitle}>Regístrate para ver más</Text>
              <Text style={styles.gateText}>
                Crea una cuenta gratis para ver el perfil completo, contacto y publicaciones de {prof.name}.
              </Text>
              <TouchableOpacity style={styles.gatePrimary} onPress={() => navigation.navigate('Register')} activeOpacity={0.85}>
                <Ionicons name="person-add" size={16} color="#000" />
                <Text style={styles.gatePrimaryText}>Crear cuenta gratis</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.gateSecondary} onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
                <Text style={styles.gateSecondaryText}>Ya tengo cuenta · Iniciar sesión</Text>
              </TouchableOpacity>
            </View>
          )}

          {user && <>

          {prof.avg_rating > 0 && (
            <View style={styles.ratingRow}>
              <StarRating value={Math.round(prof.avg_rating)} readonly size={16} />
              <Text style={styles.ratingText}>{(prof.avg_rating ?? 0).toFixed(1)} ({prof.ratings_count ?? 0} reseñas)</Text>
            </View>
          )}

          {prof.bio && <Text style={styles.bio}>{prof.bio}</Text>}

          {/* Actions */}
          <View style={styles.actions}>
            {prof.phone && (
              <TouchableOpacity style={styles.actionChip} onPress={() => Linking.openURL(`tel:${prof.phone}`)}>
                <Ionicons name="call" size={16} color={colors.primary} />
                <Text style={styles.actionChipText}>Llamar</Text>
              </TouchableOpacity>
            )}
            {prof.whatsapp && (
              <TouchableOpacity
                style={[styles.actionChip, { backgroundColor: '#25D36622' }]}
                onPress={() => Linking.openURL(`https://wa.me/${prof.whatsapp.replace(/\D/g, '')}`)}
              >
                <Ionicons name="logo-whatsapp" size={16} color="#25D366" />
                <Text style={[styles.actionChipText, { color: '#25D366' }]}>WhatsApp</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.actionChip, styles.rateChip]}
              onPress={() => user ? setShowRating(true) : navigation.navigate('Login')}
            >
              <Ionicons name="star" size={16} color="#000" />
              <Text style={[styles.actionChipText, { color: '#000' }]}>Calificar</Text>
            </TouchableOpacity>
          </View>

          {/* Social */}
          {(prof.instagram || prof.facebook || prof.website) && (
            <View style={styles.socialRow}>
              {prof.instagram && (
                <TouchableOpacity onPress={() => openLink(prof.instagram)}>
                  <Ionicons name="logo-instagram" size={26} color="#E4405F" />
                </TouchableOpacity>
              )}
              {prof.facebook && (
                <TouchableOpacity onPress={() => openLink(prof.facebook)}>
                  <Ionicons name="logo-facebook" size={26} color="#1877F2" />
                </TouchableOpacity>
              )}
              {prof.website && (
                <TouchableOpacity onPress={() => openLink(prof.website)}>
                  <Ionicons name="globe" size={26} color={colors.info} />
                </TouchableOpacity>
              )}
            </View>
          )}

          </>}
        </View>

        {user && <>

        {/* Publicaciones */}
        <View style={styles.postsSection}>
          <Text style={styles.reviewsTitle}>Publicaciones ({posts.length})</Text>
          {posts.length > 0 ? (
            posts.map((p) => <PostCard key={p.id} post={p} />)
          ) : (
            <View style={styles.emptyReviews}>
              <Text style={styles.emptyText}>Aún no hay publicaciones</Text>
            </View>
          )}
        </View>

        {/* Reseñas */}
        <View style={styles.reviewsSection}>
          <Text style={styles.reviewsTitle}>Reseñas ({ratings.length})</Text>
          {ratings.length > 0 ? (
            ratings.map((r) => (
              <View key={r.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewAvatar}>
                    <Text style={styles.reviewAvatarText}>{r.user_name?.[0]?.toUpperCase() || '?'}</Text>
                  </View>
                  <View>
                    <Text style={styles.reviewName}>{r.user_name || 'Usuario'}</Text>
                    <StarRating value={r.score} readonly size={13} />
                  </View>
                </View>
                {r.comment && <Text style={styles.reviewComment}>{r.comment}</Text>}
              </View>
            ))
          ) : (
            <View style={styles.emptyReviews}>
              <Text style={styles.emptyText}>Sin reseñas todavía</Text>
            </View>
          )}
        </View>

        </>}
      </ScrollView>

      {/* Rating Modal */}
      <Modal visible={showRating} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Calificar a {prof.name}</Text>
            <View style={styles.modalStars}>
              <StarRating value={myScore} onChange={setMyScore} size={36} />
            </View>
            <TextInput
              style={styles.commentInput}
              placeholder="Deja un comentario (opcional)"
              placeholderTextColor={colors.textMuted}
              value={myComment}
              onChangeText={setMyComment}
              multiline numberOfLines={3}
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowRating(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={submitRating} disabled={ratingLoading}>
                {ratingLoading ? <ActivityIndicator color="#000" size="small" /> : <Text style={styles.submitText}>Enviar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  coverWrap: { height: 200 },
  cover: { width: '100%', height: '100%' },
  backBtn: {
    position: 'absolute', left: 16,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', alignItems: 'center',
  },
  profile: { alignItems: 'center', padding: spacing.lg, marginTop: -44 },
  avatarWrap: { marginBottom: spacing.md },
  avatar: { width: 88, height: 88, borderRadius: 44, borderWidth: 3, borderColor: colors.primary },
  avatarPlaceholder: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: colors.primaryFaded,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: colors.primary,
  },
  initials: { fontSize: 30, fontWeight: '800', color: colors.primary },
  name: { ...typography.h2, textAlign: 'center' },
  profession: { fontSize: 14, color: colors.primary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  ratingText: { fontSize: 13, color: colors.textSecondary },
  bio: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20, marginTop: spacing.md, paddingHorizontal: spacing.lg },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.lg, justifyContent: 'center' },
  actionChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.primaryFaded,
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.primary + '44',
  },
  actionChipText: { fontSize: 13, fontWeight: '600', color: colors.primary },
  rateChip: { backgroundColor: colors.primary, borderColor: colors.primary },
  socialRow: { flexDirection: 'row', gap: spacing.xl, marginTop: spacing.lg },
  gate: {
    alignSelf: 'stretch', alignItems: 'center', marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border,
    padding: spacing.xl,
  },
  gateIcon: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.primaryFaded,
    justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md,
  },
  gateTitle: { ...typography.h3, textAlign: 'center', marginBottom: spacing.sm },
  gateText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: spacing.lg },
  gatePrimary: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    backgroundColor: colors.primary, paddingVertical: 14, paddingHorizontal: spacing.xl,
    borderRadius: radius.full, alignSelf: 'stretch',
  },
  gatePrimaryText: { fontSize: 15, fontWeight: '800', color: '#000' },
  gateSecondary: { paddingVertical: spacing.md },
  gateSecondaryText: { fontSize: 14, color: colors.primary, fontWeight: '600' },
  postsSection: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  reviewsSection: { paddingHorizontal: spacing.lg },
  reviewsTitle: { ...typography.h3, marginBottom: spacing.md },
  reviewCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md, padding: spacing.md,
    marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border,
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
  emptyReviews: { alignItems: 'center', padding: spacing.xl },
  emptyText: { fontSize: 14, color: colors.textMuted },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modal: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl,
    padding: spacing.xl, paddingBottom: 40,
  },
  modalTitle: { ...typography.h3, textAlign: 'center', marginBottom: spacing.lg },
  modalStars: { alignItems: 'center', marginBottom: spacing.lg },
  commentInput: {
    backgroundColor: colors.surface2, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, color: colors.text, fontSize: 14,
    minHeight: 80, textAlignVertical: 'top', marginBottom: spacing.lg,
  },
  modalBtns: { flexDirection: 'row', gap: spacing.md },
  cancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center',
  },
  cancelText: { fontSize: 15, color: colors.textSecondary, fontWeight: '600' },
  submitBtn: {
    flex: 1, paddingVertical: 14, borderRadius: radius.full,
    backgroundColor: colors.primary, alignItems: 'center',
  },
  submitText: { fontSize: 15, color: '#000', fontWeight: '800' },
});
