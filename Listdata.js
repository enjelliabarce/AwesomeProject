import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Button, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faGraduationCap, faChevronRight } from '@fortawesome/free-solid-svg-icons';

const Listdata = () => {
  const jsonUrl = 'http://192.168.80.67:3000/mahasiswa';
  const [isLoading, setLoading] = useState(true);
  const [dataUser, setDataUser] = useState([]);
  const [refresh, setRefresh] = useState(false);

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
    fetch('${jsonUrl}/${id}', { method: 'DELETE' })
      .then((response) => response.json())
      .then(() => {
        Alert.alert('Data terhapus');
        fetchData();
      })
      .catch((error) => console.error(error));
  };

  return (
    <SafeAreaView style={styles.container}>
      {isLoading ? (
        <View style={{ alignItems: 'center', marginTop: 20 }}>
          <Text style={styles.cardtitle}>Loading...</Text>
        </View>
      ) : (
        <FlatList
          style={{ marginBottom: 0 }}
          data={dataUser}
          onRefresh={refreshPage}
          refreshing={refresh}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity>
              <View style={styles.card}>
                <View style={styles.avatar}>
                  <FontAwesomeIcon icon={faGraduationCap} size={50} color={item.color} />
                </View>
                <View>
                  <Text style={styles.cardtitle}>{item.first_name} {item.last_name}</Text>
                  <Text>{item.kelas}</Text>
                  <Text>{item.gender}</Text>
                </View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-end' }}>
                  <FontAwesomeIcon icon={faChevronRight} size={20} />
                </View>
              </View>
              <View style={styles.form}>
                <Button
                  title="Hapus"
                  onPress={() => Alert.alert('Hapus data', 'Yakin akan menghapus data ini?', [
                    { text: 'Tidak', onPress: () => console.log('Tidak') },
                    { text: 'Ya', onPress: () => deleteData(item.id) },
                  ])}
                  color="red"
                />
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  form: {
    padding: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    elevation: 2,
  },
  avatar: {
    marginRight: 15,
  },
  cardtitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Listdata;