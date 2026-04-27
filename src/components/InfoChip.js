import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import C from '../theme/colors';

export const InfoChip = ({ label, value }) => (
  <View style={s.chip}>
    <Text style={s.label}>{label}</Text>
    <Text style={s.value}>{value}</Text>
  </View>
);

const s = StyleSheet.create({
  chip: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  label: { fontSize: 10, color: C.textSecondary, marginBottom: 1 },
  value: { fontSize: 12, fontWeight: '700', color: C.dark },
});
