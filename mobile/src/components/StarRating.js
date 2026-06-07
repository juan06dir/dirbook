import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

export default function StarRating({ value = 0, onChange, size = 24, readonly = false }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => !readonly && onChange?.(star)}
          onPressIn={() => !readonly && setHovered(star)}
          onPressOut={() => !readonly && setHovered(0)}
          disabled={readonly}
          activeOpacity={0.7}
        >
          <Ionicons
            name={display >= star ? 'star' : 'star-outline'}
            size={size}
            color={display >= star ? colors.primary : colors.textMuted}
            style={styles.star}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  star: { marginHorizontal: 2 },
});
