import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  Alert
} from 'react-native';

import { Calendar } from 'react-native-calendars';
import { getDatabase, ref, onValue } from "firebase/database";

const Mahasiswa = ({ navigation }) => {

  const [dataMotor, setDataMotor] = useState([]);

  const [selectedMotor, setSelectedMotor] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [markedDates, setMarkedDates] = useState({});

  const db = getDatabase();

  // 🔥 AMBIL DATA DARI FIREBASE
  useEffect(() => {
    const motorRef = ref(db, 'motor');

    onValue(motorRef, snapshot => {
      const val = snapshot.val();
      let arr = [];

      if (val) {
        for (let id in val) {
          arr.push({ id, ...val[id] });
        }
      }

      setDataMotor(arr);
    });
  }, []);

  // 🔥 HANDLE PILIH TANGGAL
  const handleDayPress = (day) => {

    if (!startDate) {
      setStartDate(day.dateString);
      setMarkedDates({
        [day.dateString]: {
          startingDay: true,
          color: '#4F46E5',
          textColor: 'white'
        }
      });
      return;
    }

    if (!endDate) {
      let start = new Date(startDate);
      let end = new Date(day.dateString);

      if (end < start) {
        Alert.alert("Tanggal tidak boleh terbalik!");
        return;
      }

      let dates = {};
      let current = new Date(start);

      while (current <= end) {
        let d = current.toISOString().split('T')[0];
        dates[d] = {
          color: '#4F46E5',
          textColor: 'white'
        };
        current.setDate(current.getDate() + 1);
      }

      setEndDate(day.dateString);
      setMarkedDates(dates);
      return;
    }

    // reset ulang
    setStartDate(day.dateString);
    setEndDate('');
    setMarkedDates({});
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Rental Motor</Text>

      <FlatList
        data={dataMotor}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>

            <Image
              source={{
                uri: item.foto || 'https://i.imgur.com/7yUvePI.jpg'
              }}
              style={styles.image}
            />

            <View style={styles.info}>
              <Text style={styles.nama}>{item.nama}</Text>
              <Text style={styles.plat}>{item.plat}</Text>
              <Text style={styles.harga}>Rp {item.harga} / hari</Text>

              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  setSelectedMotor(item);
                  setShowModal(true);
                }}
              >
                <Text style={styles.buttonText}>Sewa</Text>
              </TouchableOpacity>
            </View>

          </View>
        )}
      />

      {/* 🔥 MODAL KALENDER */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modal}>
          <View style={styles.modalContent}>

            <Text style={styles.modalTitle}>Pilih Tanggal</Text>

            <Calendar
              markingType={'period'}
              markedDates={markedDates}
              onDayPress={handleDayPress}
            />

            <View style={styles.dateBox}>
              <Text>Dari: {startDate || '-'}</Text>
              <Text>Sampai: {endDate || '-'}</Text>
            </View>

            <View style={styles.buttonContainer}>

              <TouchableOpacity
                style={styles.cancel}
                onPress={() => {
                  setShowModal(false);
                  setStartDate('');
                  setEndDate('');
                  setMarkedDates({});
                }}
              >
                <Text style={styles.cancelText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirm}
                onPress={() => {

                  if (!startDate || !endDate) {
                    Alert.alert("Pilih tanggal dulu!");
                    return;
                  }

                  navigation.navigate('Pesan Disini', {
                    nama_motor: selectedMotor.nama,
                    plat_motor: selectedMotor.plat,
                    startDate,
                    endDate
                  });

                  setShowModal(false);
                }}
              >
                <Text style={{ color: '#fff' }}>Konfirmasi</Text>
              </TouchableOpacity>

            </View>

          </View>
        </View>
      </Modal>

    </View>
  );
};

export default Mahasiswa;

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 15
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10
  },

  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    elevation: 3
  },

  image: {
    width: 110,
    height: 110,
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15
  },

  info: {
    flex: 1,
    padding: 10
  },

  nama: {
    fontWeight: 'bold',
    fontSize: 16
  },

  plat: {
    color: '#6B7280'
  },

  harga: {
    color: '#4F46E5',
    marginTop: 5
  },

  button: {
    backgroundColor: '#4F46E5',
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center'
  },

  buttonText: {
    color: '#fff'
  },

  modal: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)'
  },

  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20
  },

  modalTitle: {
    fontWeight: 'bold',
    marginBottom: 10
  },

  dateBox: {
    marginTop: 10,
    backgroundColor: '#F3F4F6',
    padding: 10,
    borderRadius: 10
  },

  buttonContainer: {
    flexDirection: 'row',
    marginTop: 15
  },

  cancel: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    padding: 12,
    borderRadius: 10,
    marginRight: 8,
    alignItems: 'center'
  },

  cancelText: {
    color: '#111827',
    fontWeight: '500'
  },

  confirm: {
    flex: 1,
    backgroundColor: '#4F46E5',
    padding: 12,
    borderRadius: 10,
    marginLeft: 8,
    alignItems: 'center'
  }

});