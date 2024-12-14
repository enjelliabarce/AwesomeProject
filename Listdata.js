import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBowlRice, faChevronRight } from '@fortawesome/free-solid-svg-icons';

const Listdata = () => {
  const jsonUrl = 'http://192.168.180.67:3000/mahasiswa';
  const [isLoading, setLoading] = useState(true);
  const [dataUser, setDataUser] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [completedData, setCompletedData] = useState([]);

  const fetchData = () => {
    setLoading(true);
    fetch(jsonUrl)
      .then((response) => response.json())
      .then((json) => {
        setDataUser(json);
      })
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refreshPage = () => {
    setRefresh(true);
    fetchData();
    setRefresh(false);
  };

  const deleteData = (id) => {
    fetch(`${jsonUrl}/${id}`, { method: 'DELETE' })
      .then((response) => response.json())
      .then(() => {
        Alert.alert('Data terhapus');
        fetchData();
      })
      .catch((error) => console.error(error));
  };

  const completeOrder = (item) => {
    setCompletedData([...completedData, item]);
    setDataUser(dataUser.filter((user) => user.id !== item.id));
  };

  const renderItem = ({ item, isCompleted = false }) => (
    <TouchableOpacity>
      <View style={[styles.card, isCompleted && styles.completedCard]}>
        <View style={styles.avatar}>
          <FontAwesomeIcon icon={faBowlRice} size={50} color={item.color} />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.first_name} </Text>
          <Text style={styles.cardTitle}>{item.last_name}</Text>
          <Text style={styles.cardSubtitle}>{item.kelas} - {item.gender}</Text>
          <Text style={styles.cardDetails}>Jumlah Makanan: {item.foodQuantity}</Text>
          <Text style={styles.cardDetails}>Jumlah Minuman: {item.drinkQuantity}</Text>
        </View>
        <FontAwesomeIcon icon={faChevronRight} size={20} style={styles.icon} />
      </View>
      {!isCompleted && (
        <View style={styles.buttonGroup}>
          <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={() => deleteData(item.id)}>
            <Text style={styles.buttonText}>Hapus</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.completeButton]} onPress={() => completeOrder(item)}>
            <Text style={styles.buttonText}>Selesai</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Pesanan</Text>
      </View>
      {isLoading ? (
        <View style={styles.loading}>
          <Text style={styles.cardTitle}>Loading...</Text>
        </View>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Pesanan Aktif</Text>
          <FlatList
            data={dataUser}
            onRefresh={refreshPage}
            refreshing={refresh}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => renderItem({ item })}
          />
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Pesanan Selesai</Text>
          <FlatList
            data={completedData}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => renderItem({ item, isCompleted: true })}
          />
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  header: {
    backgroundColor: '#4caf50',
    padding: 15,
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  loading: {
    alignItems: 'center',
    marginTop: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  completedCard: {
    backgroundColor: '#e0ffe0',
  },
  avatar: {
    marginRight: 15,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#555',
  },
  cardDetails: {
    fontSize: 12,
    color: '#777',
  },
  icon: {
    color: '#aaa',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 10,
    marginTop: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 10,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 10,
    marginBottom: 10,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#ff5252',
  },
  completeButton: {
    backgroundColor: '#4caf50',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Listdata;
