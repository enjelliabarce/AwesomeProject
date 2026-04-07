import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity
} from 'react-native';

const Createdata = ({ route }) => {

  const {
    nama_motor,
    plat_motor,
    startDate,
    endDate
  } = route.params || {};

  const [nama, setNama] = useState(nama_motor || '');
  const [plat, setPlat] = useState(plat_motor || '');
  const [helm, setHelm] = useState(0);

  const [deliveryType, setDeliveryType] = useState('ambil'); // ambil / antar
  const [alamat, setAlamat] = useState('');

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Cart</Text>
      </View>

      {/* CARD */}
      <View style={styles.card}>

        <Text style={styles.motor}>{nama}</Text>
        <Text style={styles.plat}>{plat}</Text>

        <Text style={styles.date}>
          {startDate} - {endDate}
        </Text>

        {/* JUMLAH HELM */}
        <Text style={styles.label}>Jumlah Helm</Text>

        <View style={styles.qtyRow}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => helm > 0 && setHelm(helm - 1)}
          >
            <Text style={styles.qtyText}>-</Text>
          </TouchableOpacity>

          <Text style={styles.qtyNumber}>{helm}</Text>

          <TouchableOpacity
            style={[styles.qtyBtn, styles.qtyPlus]}
            onPress={() => setHelm(helm + 1)}
          >
            <Text style={[styles.qtyText, { color: '#fff' }]}>+</Text>
          </TouchableOpacity>
        </View>

      </View>

      {/* DELIVERY OPTION */}
      <Text style={styles.section}>Metode Pengambilan</Text>

      <View style={styles.deliveryRow}>

        <TouchableOpacity
          style={[
            styles.deliveryBtn,
            deliveryType === 'ambil' && styles.activeBtn
          ]}
          onPress={() => setDeliveryType('ambil')}
        >
          <Text style={deliveryType === 'ambil' && styles.activeText}>
            Ambil di Tempat
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.deliveryBtn,
            deliveryType === 'antar' && styles.activeBtn
          ]}
          onPress={() => setDeliveryType('antar')}
        >
          <Text style={deliveryType === 'antar' && styles.activeText}>
            Diantar
          </Text>
        </TouchableOpacity>

      </View>

      {/* MUNCUL HANYA JIKA ANTAR */}
      {deliveryType === 'antar' && (
        <TextInput
          placeholder="Alamat Pengantaran"
          style={styles.input}
          value={alamat}
          onChangeText={setAlamat}
        />
      )}

      {/* NOTE */}
      <TextInput
        placeholder="Catatan (Opsional)"
        style={styles.input}
      />

      {/* BUTTON */}
      <View style={styles.buttonRow}>

        <TouchableOpacity style={styles.cancel}>
          <Text>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.continue}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>
            Continue →
          </Text>
        </TouchableOpacity>

      </View>

    </View>
  );
};

export default Createdata;

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F5F6F8'
  },

  header: {
    backgroundColor: '#E7C873',
    padding: 20
  },

  headerText: {
    fontSize: 22,
    fontWeight: 'bold'
  },

  card: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 15,
    padding: 15,
    elevation: 3
  },

  motor: {
    fontSize: 16,
    fontWeight: 'bold'
  },

  plat: {
    color: '#6B7280',
    marginTop: 3
  },

  date: {
    marginTop: 8,
    color: '#6B7280'
  },

  label: {
    marginTop: 10,
    fontWeight: '600'
  },

  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10
  },

  qtyBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center'
  },

  qtyPlus: {
    backgroundColor: '#000'
  },

  qtyText: {
    fontSize: 18,
    fontWeight: 'bold'
  },

  qtyNumber: {
    marginHorizontal: 15,
    fontSize: 16
  },

  section: {
    marginLeft: 15,
    marginTop: 10,
    fontSize: 18,
    fontWeight: '600'
  },

  deliveryRow: {
    flexDirection: 'row',
    margin: 15
  },

  deliveryBtn: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginRight: 10,
    alignItems: 'center'
  },

  activeBtn: {
    backgroundColor: '#E7C873',
    borderColor: '#E7C873'
  },

  activeText: {
    fontWeight: '600'
  },

  input: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginHorizontal: 15,
    marginTop: 15,
    paddingVertical: 8
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15
  },

  cancel: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 15,
    borderRadius: 12,
    width: '45%',
    alignItems: 'center'
  },

  continue: {
    backgroundColor: '#E7C873',
    padding: 15,
    borderRadius: 12,
    width: '45%',
    alignItems: 'center'
  }

});