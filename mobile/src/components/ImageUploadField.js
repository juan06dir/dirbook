import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { uploadImage, API_URL } from '../api';
import { colors, spacing, radius } from '../theme';

function resolveUri(value) {
  if (!value) return null;
  return value.startsWith('http') ? value : `${API_URL}${value}`;
}

export default function ImageUploadField({
  label,
  value,
  onChange,
  aspect = [1, 1],
  rounded = false,
  height = 120,
  icon = 'image-outline',
}) {
  const [uploading, setUploading] = useState(false);
  const uri = resolveUri(value);

  async function pick() {
    if (uploading) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tus fotos para subir la imagen.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect,
      quality: 0.85,
    });
    if (res.canceled) return;
    setUploading(true);
    try {
      const up = await uploadImage(res.assets[0].uri);
      onChange(up.url);
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo subir la imagen.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <View style={styles.field}>
      {!!label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={[
          styles.box,
          { height },
          rounded && { width: height, borderRadius: height / 2, alignSelf: 'center' },
        ]}
        onPress={pick}
        activeOpacity={0.8}
      >
        {uri ? (
          <Image
            source={{ uri }}
            style={[styles.preview, rounded && { borderRadius: height / 2 }]}
          />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name={icon} size={28} color={colors.textMuted} />
            <Text style={styles.placeholderText}>Toca para elegir</Text>
          </View>
        )}

        {uploading && (
          <View style={[styles.overlay, rounded && { borderRadius: height / 2 }]}>
            <ActivityIndicator color={colors.primary} />
          </View>
        )}

        {uri && !uploading && (
          <View style={styles.editBadge}>
            <Ionicons name="camera" size={15} color="#000" />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: spacing.md },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.sm },
  box: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  preview: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholder: { justifyContent: 'center', alignItems: 'center', gap: 6 },
  placeholderText: { fontSize: 12, color: colors.textMuted },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBadge: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
