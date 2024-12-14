import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, ScrollView, ImageBackground } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUtensils } from '@fortawesome/free-solid-svg-icons';
import Datamahasiswa from './data/makanan.json';

const App = () => {
    const [showMenu, setShowMenu] = useState(false);

    return (
        <View style={styles.container}>
            {showMenu ? (
                <View style={styles.menuPage}>
                    <Text style={styles.title}>🍴 Buku Menu 🍴</Text>
                    <FlatList
                        data={Datamahasiswa}
                        renderItem={({ item }) => (
                            <View style={styles.card}>
                                <Image
                                    source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSiGXAbl0a02iJXW3buJNIwumjhQLPx3udl_Q&s' }}
                                    style={styles.foodImage}v
                                />
                                <View style={styles.cardContent}>
                                    <Text style={styles.cardTitle}>{item.Makanan}</Text>
                                    <Text style={styles.cardPrice}>Harga: {item.Harga}</Text>
                                    <Text style={styles.cardInfo}>Info: {item.information}</Text>
                                    <FontAwesomeIcon 
                                        icon={faUtensils} 
                                        size={20} 
                                        color="#FF7043" 
                                        style={styles.icon} 
                                    />
                                </View>
                            </View>
                        )}
                        keyExtractor={(item, index) => index.toString()}
                    />
                    <TouchableOpacity 
                        style={styles.buttonBack} 
                        onPress={() => setShowMenu(false)}>
                        <Text style={styles.buttonText}>Kembali</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ImageBackground 
                    source={{ uri: 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' }} 
                    style={styles.landingPage}>
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <Text style={styles.landingTitle}>Selamat Datang di
                        <Text style={styles.highlight}> Enji's Kitchen</Text></Text>
                        <TouchableOpacity 
                            style={styles.button} 
                            onPress={() => setShowMenu(true)}>
                            <Text style={styles.buttonText}>Lihat Buku Menu</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </ImageBackground>
            )}
        </View>
    );
};

export default App;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E8F5E9',
    },
    landingPage: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#FFCCBC',
    },
    menuPage: {
        flex: 1,
        padding: 10,
        backgroundColor: '#FFF3E0',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#FF7043',
    },
    landingTitle: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 20,
        textAlign: 'center',
        color: '#FFFFFF',
        textShadowColor: '#000',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    highlight: {
        color: '#FFD700',
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: '#FF7043',
        paddingVertical: 14,
        paddingHorizontal: 25,
        borderRadius: 8,
        elevation: 3,
        alignSelf: 'center',
        marginTop: 10,
    },
    buttonBack: {
        backgroundColor: '#FF7043',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        elevation: 3,
        alignSelf: 'center',
        marginTop: 15,
    },
    buttonText: {
        fontSize: 16,
        color: 'white',
        fontWeight: 'bold',
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: 10,
        marginBottom: 10,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 4,
    },
    foodImage: {
        width: 120,
        height: 120,
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
    },
    cardContent: {
        flex: 1,
        padding: 15,
        justifyContent: 'center',
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    cardPrice: {
        fontSize: 16,
        color: '#4CAF50',
        marginBottom: 5,
    },
    cardInfo: {
        fontSize: 14,
        color: '#757575',
    },
    icon: {
        marginTop: 10,
    },
});
