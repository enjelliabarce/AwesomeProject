import React, { useState } from 'react';
import { SafeAreaView, View, ScrollView, TextInput, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';

const Createdata = () => {
  const jsonUrl = 'http://192.168.180.67:3000/mahasiswa';
  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [kelas, setKelas] = useState('');
  const [foodQuantity, setFoodQuantity] = useState(0);
  const [drinkQuantity, setDrinkQuantity] = useState(0);

  const incrementFoodQuantity = () => setFoodQuantity(foodQuantity + 1);
  const decrementFoodQuantity = () => {
    if (foodQuantity > 0) {
      setFoodQuantity(foodQuantity - 1);
    }
  };

  const incrementDrinkQuantity = () => setDrinkQuantity(drinkQuantity + 1);
  const decrementDrinkQuantity = () => {
    if (drinkQuantity > 0) {
      setDrinkQuantity(drinkQuantity - 1);
    }
  };

  const submit = () => {
    const data = {
      first_name,
      last_name,
      kelas,
      foodQuantity,
      drinkQuantity,
    };
    fetch(jsonUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then(() => {
        alert('Mohon Ditunggu,Bestie!!');
        setFirstName('');
        setLastName('');
        setKelas('');
        setFoodQuantity(0);
        setDrinkQuantity(0);
      });
  };

  return (
    <ImageBackground source={{ uri: 'https://source.unsplash.com/featured/?food,drink' }} style={styles.backgroundImage}>
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Pesan Makanan dan Minuman</Text>
        <ScrollView contentContainerStyle={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Nama Makanan"
            value={first_name}
            onChangeText={setFirstName}
          />
          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>Jumlah Makanan:</Text>
            <TouchableOpacity style={styles.quantityButton} onPress={decrementFoodQuantity}>
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantityText}>{foodQuantity}</Text>
            <TouchableOpacity style={styles.quantityButton} onPress={incrementFoodQuantity}>
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Nama Minuman"
            value={last_name}
            onChangeText={setLastName}
          />
          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>Jumlah Minuman:</Text>
            <TouchableOpacity style={styles.quantityButton} onPress={decrementDrinkQuantity}>
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantityText}>{drinkQuantity}</Text>
            <TouchableOpacity style={styles.quantityButton} onPress={incrementDrinkQuantity}>
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Catatan"
            value={kelas}
            onChangeText={setKelas}
          />
          <TouchableOpacity style={styles.submitButton} onPress={submit}>
            <Text style={styles.submitButtonText}>Pesan Sekarang</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default Createdata;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginVertical: 20,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  form: {
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    backgroundColor: 'rgba(255,255,255,0.8)',
    fontSize: 16,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  quantityLabel: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },
  quantityButton: {
    backgroundColor: '#007bff',
    borderRadius: 5,
    padding: 10,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
