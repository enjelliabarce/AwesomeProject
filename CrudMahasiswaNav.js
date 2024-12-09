import * as React from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Profil from './App';
import Mahasiswa from './Mahasiswa';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faUser, faUserGraduate, faPlusCircle, faUserPen } from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { WebView } from 'react-native-webview';
import Createdata from './Createdata';
import DataMahasiswa from './Listdata';
import EditData from './EditData';

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

const Tab = createBottomTabNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Tab.Navigator>
                <Tab.Screen name="Tambah" component={HomeScreen} options={{
                    headerShown: false,
                    tabBarIcon: ({ color }) => (
                        <FontAwesomeIcon icon={faPlusCircle} color={color} size={20} />
                    ),
                }} />
                <Tab.Screen name="Data Mahasiswa" component={DataMahasiswaScreen} options={{
                    tabBarIcon: ({ color }) => (
                        <FontAwesomeIcon icon={faUserGraduate} color={color} size={20} />
                    ),
                }} />
                <Tab.Screen name="Edit" component={EditScreen} options={{
                    tabBarIcon: ({ color }) => (
                        <FontAwesomeIcon icon={faUserPen} color={color} size={20} />
                    ),
                }} />
            </Tab.Navigator>
        </NavigationContainer>
    );
}