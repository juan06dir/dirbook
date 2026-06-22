import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createPost, updatePost } from '../../api';
import ImageUploadField from '../../components/ImageUploadField';
import { colors, spacing, radius, typography } from '../../theme';

const TYPES = [
  { key: 'post', label: 'Publicación', icon: 'newspaper' },
  { key: 'event', label: 'Evento', icon: 'calendar' },
  { key: 'discount', label: 'Descuento', icon: 'pricetag' },
];

function Field({ label, icon, value, onChangeText, placeholder, ...rest }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        {icon && <Ionicons name={icon} size={18} color={colors.textMuted} style={styles.inputIcon} />}
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          {...rest}
        />
      </View>
    </View>
  );
}

// Convierte "AAAA-MM-DD" a ISO; devuelve null si está vacío/ inválido.
function toIso(dateStr) {
  if (!dateStr || !dateStr.trim()) return null;
  const m = dateStr.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  return `${dateStr.trim()}T00:00:00`;
}

// Convierte ISO a "AAAA-MM-DD" para precargar el formulario.
function toDateInput(iso) {
  if (!iso) return '';
  const m = String(iso).match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : '';
}

export default function CreatePostScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const editing = route.params?.post || null;
  const onSaved = route.params?.onSaved || null;
  const local = route.params?.local || null;
  const professional = route.params?.professional || null;
  const authorName =
    local?.name || professional?.name ||
    (editing ? (editing.local_name || editing.professional_name) : null) || 'tu perfil';

  const [type, setType] = useState(editing?.post_type || 'post');
  const [title, setTitle] = useState(editing?.title || '');
  const [content, setContent] = useState(editing?.content || '');
  const [eventStart, setEventStart] = useState(toDateInput(editing?.event_start));
  const [eventEnd, setEventEnd] = useState(toDateInput(editing?.event_end));
  const [discount, setDiscount] = useState(
    editing?.discount_pct != null ? String(editing.discount_pct) : ''
  );
  const [imageUrl, setImageUrl] = useState(editing?.image_url || null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!content.trim()) {
      Alert.alert('Falta el contenido', 'Escribe el texto de tu publicación.');
      return;
    }
    if (type === 'discount') {
      const pct = parseFloat(discount);
      if (!pct || pct <= 0 || pct > 100) {
        Alert.alert('Descuento inválido', 'Ingresa un porcentaje entre 1 y 100.');
        return;
      }
    }
    const payload = {
      post_type: type,
      content: content.trim(),
      title: title.trim() || null,
    };
    if (!editing && local) payload.local_id = local.id;
    if (!editing && professional) payload.professional_id = professional.id;
    payload.event_start = type === 'event' ? toIso(eventStart) : null;
    payload.event_end = type === 'event' ? toIso(eventEnd) : null;
    payload.discount_pct = type === 'discount' ? parseFloat(discount) : null;
    payload.image_url = imageUrl || null;

    setLoading(true);
    try {
      if (editing) {
        const updated = await updatePost(editing.id, payload);
        if (onSaved) onSaved(updated);
        Alert.alert('Guardado', 'Tu publicación se actualizó.', [
          { text: 'Listo', onPress: () => navigation.goBack() },
        ]);
      } else {
        await createPost(payload);
        Alert.alert('¡Publicado!', 'Tu publicación ya está en Dirbook.', [
          { text: 'Listo', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo publicar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{editing ? 'Editar publicación' : 'Nueva publicación'}</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 60 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.author}>{editing ? 'Editando' : 'Publicando'} como <Text style={styles.authorName}>{authorName}</Text></Text>

        <Text style={styles.label}>Tipo</Text>
        <View style={styles.typeRow}>
          {TYPES.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[styles.typeBtn, type === t.key && styles.typeBtnActive]}
              onPress={() => setType(t.key)}
              activeOpacity={0.8}
            >
              <Ionicons name={t.icon} size={18} color={type === t.key ? '#000' : colors.primary} />
              <Text style={[styles.typeText, type === t.key && styles.typeTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Field label="Título (opcional)" icon="text-outline" value={title} onChangeText={setTitle} placeholder="Ej: ¡Gran promoción!" />

        <View style={styles.field}>
          <Text style={styles.label}>Contenido *</Text>
          <View style={[styles.inputWrap, { alignItems: 'flex-start' }]}>
            <TextInput
              style={[styles.input, { minHeight: 110, textAlignVertical: 'top' }]}
              placeholder="¿Qué quieres compartir?"
              placeholderTextColor={colors.textMuted}
              value={content}
              onChangeText={setContent}
              multiline
            />
          </View>
        </View>

        {type === 'event' && (
          <>
            <Field label="Inicio del evento" icon="calendar-outline" value={eventStart} onChangeText={setEventStart} placeholder="AAAA-MM-DD" keyboardType="numbers-and-punctuation" />
            <Field label="Fin del evento" icon="calendar-outline" value={eventEnd} onChangeText={setEventEnd} placeholder="AAAA-MM-DD" keyboardType="numbers-and-punctuation" />
          </>
        )}

        {type === 'discount' && (
          <Field label="Porcentaje de descuento *" icon="pricetag-outline" value={discount} onChangeText={setDiscount} placeholder="Ej: 20" keyboardType="number-pad" />
        )}

        <ImageUploadField
          label="Imagen (opcional)"
          value={imageUrl}
          onChange={setImageUrl}
          aspect={[16, 9]}
          height={160}
          icon="image-outline"
        />

        <TouchableOpacity style={styles.submit} onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
          {loading ? <ActivityIndicator color="#000" /> : (
            <>
              <Ionicons name={editing ? 'checkmark' : 'send'} size={18} color="#000" />
              <Text style={styles.submitText}>{editing ? 'Guardar cambios' : 'Publicar'}</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingBottom: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
    backgroundColor: colors.bg,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: colors.surface,
  },
  headerTitle: { ...typography.h3 },

  author: { fontSize: 13, color: colors.textMuted, marginBottom: spacing.lg },
  authorName: { color: colors.primary, fontWeight: '700' },

  field: { marginBottom: spacing.md },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.sm },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  inputIcon: { marginRight: spacing.sm },
  input: { flex: 1, minHeight: 48, fontSize: 15, color: colors.text, paddingVertical: 10 },

  typeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  typeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 12, borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border,
  },
  typeBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  typeText: { fontSize: 13, fontWeight: '700', color: colors.primary },
  typeTextActive: { color: '#000' },

  hint: { fontSize: 12, color: colors.textMuted, marginTop: spacing.sm, marginBottom: spacing.lg, textAlign: 'center' },

  submit: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    backgroundColor: colors.primary,
    height: 54, borderRadius: radius.full,
  },
  submitText: { fontSize: 16, fontWeight: '800', color: '#000' },
});
