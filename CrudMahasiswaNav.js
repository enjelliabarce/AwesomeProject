import * as React from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Profil from './App';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUser, faUserGraduate} from '@fortawesome/free-solid-svg-icons';
import { WebView } from 'react-native-webview';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import Createdata from './Createdata';
import Listdata from './Listdata';

import Mahasiswa from './Mahasiswa';

function HomeScreen() {
  return (
    <Createdata/>
  );
}

function SettingsScreen() {
  return (
   <Listdata/>
  );
}
function WebScreen() {
  return (
    <WebView
      source={{ uri: 'https://github.com/enjelliabarce' }}
      style={{ flex: 1 }} // Optional: Makes WebView take up the full screen
    />
  );
}

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <FontAwesomeIcon icon={faUser} color={color} size={20} />
            ),
          }}
        />
        <Tab.Screen
          name="Data Mahasiswa"
          component={SettingsScreen}
          options={{
            tabBarIcon: ({ color }) => (
              <FontAwesomeIcon icon={faUserGraduate} color={color} size={20} />
            ),
          }}
        />
        <Tab.Screen
          name="Github"
          component={WebScreen}
          options={{
            tabBarIcon: ({ color }) => (
              <FontAwesomeIcon icon={faGithub} color={color} size={20} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}