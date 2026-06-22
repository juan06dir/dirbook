import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createProfessional, updateProfessional } from '../../api';
import ImageUploadField from '../../components/ImageUploadField';
import { colors, spacing, radius, typography } from '../../theme';

const PROFESSIONS = [
  'Abogado', 'Contador', 'Médico', 'Odontólogo', 'Psicólogo',
  'Arquitecto', 'Ingeniero', 'Diseñador', 'Desarrollador', 'Fotógrafo',
  'Electricista', 'Plomero', 'Carpintero', 'Mecánico', 'Estilista',
  'Entrenador', 'Profesor', 'Nutricionista', 'Veterinario', 'Otro',
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

export default function CreateProfessionalScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const editing = route.params?.professional || null;
  const [form, setForm] = useState({
    name: editing?.name || '', profession: editing?.profession || '',
    bio: editing?.bio || '', phone: editing?.phone || '',
    whatsapp: editing?.whatsapp || '', website: editing?.website || '',
    facebook: editing?.facebook || '', instagram: editing?.instagram || '',
  });
  const [avatar, setAvatar] = useState(editing?.avatar || null);
  const [coverImage, setCoverImage] = useState(editing?.cover_image || null);
  const [loading, setLoading] = useState(false);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit() {
    if (!form.name.trim()) { Alert.alert('Falta el nombre', 'Escribe tu nombre.'); return; }
    if (!form.profession) { Alert.alert('Falta la profesión', 'Selecciona una profesión.'); return; }
    setLoading(true);
    try {
      if (editing) {
        const payload = {};
        Object.entries(form).forEach(([k, v]) => { payload[k] = (v && v.trim()) ? v.trim() : null; });
        payload.avatar = avatar || null;
        payload.cover_image = coverImage || null;
        await updateProfessional(editing.id, payload);
        Alert.alert('Cambios guardados', 'Tu perfil se actualizó.', [
          { text: 'Listo', onPress: () => navigation.goBack() },
        ]);
      } else {
        const payload = {};
        Object.entries(form).forEach(([k, v]) => { if (v && v.trim()) payload[k] = v.trim(); });
        if (avatar) payload.avatar = avatar;
        if (coverImage) payload.cover_image = coverImage;
        await createProfessional(payload);
        Alert.alert('¡Perfil creado!', 'Tu perfil profesional ya está publicado en Dirbook.', [
          { text: 'Listo', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo guardar el perfil.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{editing ? 'Editar perfil' : 'Crear perfil profesional'}</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 60 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ImageUploadField
          label="Portada"
          value={coverImage}
          onChange={setCoverImage}
          aspect={[16, 9]}
          height={140}
          icon="image-outline"
        />
        <ImageUploadField
          label="Foto de perfil"
          value={avatar}
          onChange={setAvatar}
          aspect={[1, 1]}
          height={96}
          rounded
          icon="person-outline"
        />

        <Field label="Nombre completo *" icon="person-outline" value={form.name} onChangeText={set('name')} placeholder="Ej: Ana María Gómez" />

        <Text style={styles.label}>Profesión *</Text>
        <View style={styles.chips}>
          {PROFESSIONS.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.chip, form.profession === c && styles.chipActive]}
              onPress={() => set('profession')(c)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, form.profession === c && styles.chipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Field label="Sobre ti" icon="document-text-outline" value={form.bio} onChangeText={set('bio')} placeholder="Cuéntale a tus clientes sobre tu experiencia" multiline />
        <Field label="Teléfono" icon="call-outline" value={form.phone} onChangeText={set('phone')} placeholder="3001234567" keyboardType="phone-pad" />
        <Field label="WhatsApp" icon="logo-whatsapp" value={form.whatsapp} onChangeText={set('whatsapp')} placeholder="573001234567" keyboardType="phone-pad" />
        <Field label="Sitio web" icon="globe-outline" value={form.website} onChangeText={set('website')} placeholder="www.tusitio.com" autoCapitalize="none" />
        <Field label="Facebook" icon="logo-facebook" value={form.facebook} onChangeText={set('facebook')} placeholder="Enlace o usuario" autoCapitalize="none" />
        <Field label="Instagram" icon="logo-instagram" value={form.instagram} onChangeText={set('instagram')} placeholder="@usuario" autoCapitalize="none" />

        <TouchableOpacity style={styles.submit} onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
          {loading ? <ActivityIndicator color="#000" /> : (
            <>
              <Ionicons name="checkmark-circle" size={18} color="#000" />
              <Text style={styles.submitText}>{editing ? 'Guardar cambios' : 'Publicar perfil'}</Text>
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

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  chipTextActive: { color: '#000' },

  hint: { fontSize: 12, color: colors.textMuted, marginTop: spacing.sm, marginBottom: spacing.lg, textAlign: 'center' },

  submit: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    backgroundColor: colors.primary,
    height: 54, borderRadius: radius.full,
  },
  submitText: { fontSize: 16, fontWeight: '800', color: '#000' },
});
