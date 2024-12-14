import * as React from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Profil from './App';
import Mahasiswa from './Mahasiswa';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faBookOpen, faList, faPenToSquare, faPlusCircle, faUser } from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { WebView } from 'react-native-webview';
import Createdata from './Createdata';
import DataMahasiswa from './Listdata';
import EditData from './EditData';

const webmap = require('./Map.html')

function HomeScreen() {
    return (
        < Createdata />
    );
}

function DataMahasiswaScreen() {
    return (
        < DataMahasiswa />
    );
}

function EditScreen() {
    return (
        <EditData/>
    );
}
function MahasiswaScreen() {
    return (
        <Mahasiswa/>
    );
}
function MapScreen() {
    return (
       <WebView
        source={webmap}
        />
    );
}

const Tab = createBottomTabNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Tab.Navigator>
            <Tab.Screen name="Menu" component={MahasiswaScreen} options={{
                    tabBarIcon: ({ color }) => (
                        <FontAwesomeIcon icon={faBookOpen} color={color} size={20} />
                    ),
                }} />
                <Tab.Screen name="Pesan Disini" component={HomeScreen} options={{
                    headerShown: false,
                    tabBarIcon: ({ color }) => (
                        <FontAwesomeIcon icon={faPlusCircle} color={color} size={20} />
                    ),
                }} />
                <Tab.Screen name="Pesanan" component={DataMahasiswaScreen} options={{
                    tabBarIcon: ({ color }) => (
                        <FontAwesomeIcon icon={faList} color={color} size={20} />
                    ),
                }} />
                <Tab.Screen name="Edit Pesanan" component={EditScreen} options={{
                    tabBarIcon: ({ color }) => (
                        <FontAwesomeIcon icon={faPenToSquare} color={color} size={20} />
                    ),
                }} />
                <Tab.Screen name="Tentang Kami" component={MapScreen} options={{
                    tabBarIcon: ({ color }) => (
                        <FontAwesomeIcon icon={faUser} color={color} size={20} />
                    ),
                }} />
            </Tab.Navigator>
        </NavigationContainer>
    );
}