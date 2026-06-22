import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, Image,
  StyleSheet, Modal, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getComments, addComment, deleteComment, API_URL } from '../api';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, radius } from '../theme';

function imageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_URL}${path}`;
}

function initials(name) {
  if (!name) return '?';
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return 'ahora';
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 604800) return `${Math.floor(s / 86400)}d`;
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
}

function CommentRow({ item, canDelete, onDelete }) {
  const avatar = imageUrl(item.user_avatar);
  return (
    <View style={styles.row}>
      {avatar ? (
        <Image source={{ uri: avatar }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarInitials}>{initials(item.user_name)}</Text>
        </View>
      )}
      <View style={styles.bubble}>
        <View style={styles.rowTop}>
          <Text style={styles.name}>{item.user_name}</Text>
          <Text style={styles.time}>{timeAgo(item.created_at)}</Text>
        </View>
        <Text style={styles.commentText}>{item.content}</Text>
      </View>
      {canDelete && (
        <TouchableOpacity onPress={() => onDelete(item)} style={styles.delBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="trash-outline" size={15} color={colors.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function CommentsModal({ visible, onClose, postId, onCountChange }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    try {
      const data = await getComments(postId);
      setComments(data || []);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (visible) { setText(''); load(); }
  }, [visible, load]);

  async function handleSend() {
    const content = text.trim();
    if (!content) return;
    if (!user) { Alert.alert('Inicia sesión', 'Necesitas una cuenta para comentar.'); return; }
    setSending(true);
    try {
      const created = await addComment(postId, content);
      setComments((prev) => {
        const next = [...prev, created];
        onCountChange?.(next.length);
        return next;
      });
      setText('');
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo enviar el comentario.');
    } finally {
      setSending(false);
    }
  }

  function handleDelete(item) {
    Alert.alert('Eliminar comentario', '¿Seguro que quieres eliminarlo?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          setComments((prev) => {
            const next = prev.filter((c) => c.id !== item.id);
            onCountChange?.(next.length);
            return next;
          });
          try { await deleteComment(item.id); }
          catch (e) { load(); Alert.alert('Error', 'No se pudo eliminar.'); }
        },
      },
    ]);
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[styles.sheet, { paddingBottom: insets.bottom }]}
        >
          <View style={styles.handle} />
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Comentarios</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 30 }} />
          ) : (
            <FlatList
              data={comments}
              keyExtractor={(c) => String(c.id)}
              renderItem={({ item }) => (
                <CommentRow
                  item={item}
                  canDelete={!!user && (user.id === item.user_id || user.is_admin)}
                  onDelete={handleDelete}
                />
              )}
              contentContainerStyle={{ paddingVertical: spacing.sm, flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Ionicons name="chatbubble-ellipses-outline" size={40} color={colors.textMuted} />
                  <Text style={styles.emptyText}>Sé el primero en comentar</Text>
                </View>
              }
            />
          )}

          {user ? (
            <View style={styles.inputBar}>
              <TextInput
                style={styles.input}
                placeholder="Escribe un comentario…"
                placeholderTextColor={colors.textMuted}
                value={text}
                onChangeText={setText}
                multiline
                maxLength={1000}
              />
              <TouchableOpacity
                style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
                onPress={handleSend}
                disabled={!text.trim() || sending}
              >
                {sending
                  ? <ActivityIndicator color="#000" size="small" />
                  : <Ionicons name="send" size={18} color="#000" />}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.inputBar}>
              <Text style={styles.loginHint}>Inicia sesión para comentar</Text>
            </View>
          )}
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    maxHeight: '80%', minHeight: '50%',
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    borderTopWidth: 1, borderColor: colors.border,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: colors.surface3,
    alignSelf: 'center', marginTop: spacing.sm, marginBottom: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingBottom: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 16, fontWeight: '800', color: colors.text },

  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, paddingVertical: spacing.sm },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  avatarPlaceholder: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.primaryFaded,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarInitials: { fontSize: 13, fontWeight: '800', color: colors.primary },
  bubble: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
  },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 2 },
  name: { fontSize: 13, fontWeight: '700', color: colors.text },
  time: { fontSize: 11, color: colors.textMuted },
  commentText: { fontSize: 14, color: colors.textSecondary, lineHeight: 19 },
  delBtn: { padding: 4, marginTop: 6 },

  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: spacing.sm },
  emptyText: { fontSize: 14, color: colors.textMuted },

  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.md, paddingVertical: 10,
    color: colors.text, fontSize: 14, maxHeight: 110,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
  loginHint: { flex: 1, textAlign: 'center', color: colors.textMuted, fontSize: 13, paddingVertical: 12 },
});
