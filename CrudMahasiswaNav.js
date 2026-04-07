import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// LOGIN & REGISTER
import Login from './Login/Login';
import Register from './Login/Register';

// USER SCREEN
import Mahasiswa from './Mahasiswa';
import Createdata from './Createdata';
import DataMahasiswa from './Listdata';
import EditData from './EditData';
import Map from './Map';

// 🔥 ADMIN SCREEN
import AdminDashboard from './admin/AdminDashboard';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faBookOpen,
  faList,
  faPenToSquare,
  faPlusCircle,
  faMap,
} from '@fortawesome/free-solid-svg-icons';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >

        {/* LOGIN */}
        <Tab.Screen
          name="Login"
          component={Login}
          options={{
            tabBarButton: () => null,
            tabBarStyle: { display: 'none' }
          }}
        />

        {/* REGISTER */}
        <Tab.Screen
          name="Register"
          component={Register}
          options={{
            tabBarButton: () => null,
            tabBarStyle: { display: 'none' }
          }}
        />

        {/* 🔥 ADMIN DASHBOARD (DISEMBUNYIKAN) */}
        <Tab.Screen
          name="AdminDashboard"
          component={AdminDashboard}
          options={{
            tabBarButton: () => null
          }}
        />

        {/* USER MENU */}
        <Tab.Screen
          name="Menu"
          component={Mahasiswa}
          options={{
            tabBarIcon: ({ color }) => (
              <FontAwesomeIcon icon={faBookOpen} color={color} size={20} />
            ),
          }}
        />

        <Tab.Screen
          name="Pesan Disini"
          component={Createdata}
          options={{
            tabBarIcon: ({ color }) => (
              <FontAwesomeIcon icon={faPlusCircle} color={color} size={20} />
            ),
          }}
        />

        <Tab.Screen
          name="Pesanan"
          component={DataMahasiswa}
          options={{
            tabBarIcon: ({ color }) => (
              <FontAwesomeIcon icon={faList} color={color} size={20} />
            ),
          }}
        />

        <Tab.Screen
          name="Edit Pesanan"
          component={EditData}
          options={{
            tabBarIcon: ({ color }) => (
              <FontAwesomeIcon icon={faPenToSquare} color={color} size={20} />
            ),
          }}
        />

        <Tab.Screen
          name="Maps"
          component={Map}
          options={{
            tabBarIcon: ({ color }) => (
              <FontAwesomeIcon icon={faMap} color={color} size={20} />
            ),
          }}
        />

      </Tab.Navigator>
    </NavigationContainer>
  );
}