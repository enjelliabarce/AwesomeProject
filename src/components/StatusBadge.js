import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CONFIG = {
  dipinjam:   { bg: '#FFF8E6', dot: '#F5BC1B', text: '#92680A', label: 'Aktif' },
  selesai:    { bg: '#F0FDF4', dot: '#22C55E', text: '#166534', label: 'Selesai' },
  dibatalkan: { bg: '#FEF2F2', dot: '#EF4444', text: '#991B1B', label: 'Dibatalkan' },
};

export const StatusBadge = ({ status }) => {
  const c = CONFIG[status] ?? CONFIG.selesai;
  return (
    <View style={[s.badge, { backgroundColor: c.bg }]}>
      <View style={[s.dot, { backgroundColor: c.dot }]} />
      <Text style={[s.txt, { color: c.text }]}>{c.label}</Text>
    </View>
  );
};

const s = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 5,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  txt: { fontSize: 12, fontWeight: '700' },
});
