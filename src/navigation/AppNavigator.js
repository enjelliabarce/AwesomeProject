import * as React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faList,
  faMap,
  faUser,
  faMotorcycle,
} from '@fortawesome/free-solid-svg-icons';

import { onAuthStateChanged } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { auth, database } from '../config/FirebaseConfig';
import { initNotifChannels } from '../utils/NotificationService';
import {
  startNotificationService,
  stopNotificationService,
} from '../utils/NotificationBackgroundService';
import C from '../theme/colors';
const Colors = C;

// AUTH
import Login from '../screens/auth/Login';
import Register from '../screens/auth/Register';

// USER SCREENS
import MotorListScreen from '../screens/user/MotorListScreen';
import OrderFormScreen from '../screens/user/OrderFormScreen';
import OrderHistoryScreen from '../screens/user/OrderHistoryScreen';
import OrderSummary from '../screens/user/OrderSummary';

// SHARED SCREENS
import Profile from '../screens/shared/Profile';
import TrackingMapScreen from '../screens/admin/TrackingMapScreen';

// ADMIN SCREENS
import AdminMotorScreen from '../screens/admin/AdminMotorScreen';
import AdminOrderHistoryScreen from '../screens/admin/AdminOrderHistoryScreen';

const Stack = createNativeStackNavigator();
const UserTab = createBottomTabNavigator();
const AdminTab = createBottomTabNavigator();

export const navigationRef = React.createRef();

const tabBarStyle = {
  position: 'absolute',
  bottom: 24,
  left: 32,
  right: 32,
  height: 68,
  borderRadius: 34,
  backgroundColor: 'transparent',
  borderTopWidth: 0,
  elevation: 0,
  paddingBottom: 0,
  paddingTop: 0,
};

const FrostedGlass = () => (
  <View style={styles.glassRoot} pointerEvents="none">
    <View style={styles.glassTint} />
    <View style={styles.glassHighlight} />
  </View>
);

const tabBarIcon = (icon) => ({ focused }) => (
  <View style={[styles.iconWrap, focused ? styles.iconWrapActive : styles.iconWrapInactive]}>
    <FontAwesomeIcon
      icon={icon}
      color={focused ? Colors.dark : '#6B7280'}
      size={17}
    />
  </View>
);

function UserTabNav() {
  return (
    <UserTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle,
        tabBarBackground: () => <FrostedGlass />,
      }}
    >
      <UserTab.Screen
        name="Menu"
        component={MotorListScreen}
        options={{ tabBarIcon: tabBarIcon(faMotorcycle) }}
      />
      <UserTab.Screen
        name="Pesanan"
        component={OrderHistoryScreen}
        options={{ tabBarIcon: tabBarIcon(faList) }}
      />
      <UserTab.Screen
        name="Profile"
        component={Profile}
        options={{ tabBarIcon: tabBarIcon(faUser) }}
      />
    </UserTab.Navigator>
  );
}

function AdminTabNav() {
  return (
    <AdminTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle,
        tabBarBackground: () => <FrostedGlass />,
      }}
    >
      <AdminTab.Screen
        name="Dashboard Motor"
        component={AdminMotorScreen}
        options={{ tabBarIcon: tabBarIcon(faMotorcycle) }}
      />
      <AdminTab.Screen
        name="Pesanan"
        component={AdminOrderHistoryScreen}
        options={{ tabBarIcon: tabBarIcon(faList) }}
      />
      <AdminTab.Screen
        name="Peta"
        component={TrackingMapScreen}
        options={{ tabBarIcon: tabBarIcon(faMap) }}
      />
      <AdminTab.Screen
        name="Profile"
        component={Profile}
        options={{ tabBarIcon: tabBarIcon(faUser) }}
      />
    </AdminTab.Navigator>
  );
}

const SPLASH_MIN_MS = 3000;

export default function App() {
  const [initialRoute, setInitialRoute] = React.useState(null);
  const [userRole, setUserRole] = React.useState(null);
  const [userId, setUserId] = React.useState(null);
  const splashStart = React.useRef(Date.now());

  const setRouteAfterSplash = React.useCallback((route) => {
    const elapsed = Date.now() - splashStart.current;
    const remaining = Math.max(0, SPLASH_MIN_MS - elapsed);
    setTimeout(() => setInitialRoute(route), remaining);
  }, []);

  React.useEffect(() => {
    initNotifChannels();
  }, []);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const snap = await get(ref(database, 'users/' + user.uid));
          const role = snap.val()?.role;
          const route = role === 'admin' ? 'AdminHome' : 'UserHome';
          setUserRole(role);
          setUserId(user.uid);
          startNotificationService(role, user.uid);
          if (navigationRef.current?.isReady()) {
            navigationRef.current.reset({ index: 0, routes: [{ name: route }] });
          } else {
            setRouteAfterSplash(route);
          }
        } catch {
          setRouteAfterSplash('Login');
        }
      } else {
        stopNotificationService();
        setUserRole(null);
        setUserId(null);
        setRouteAfterSplash('Login');
      }
    });
    return unsubscribe;
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, backgroundColor: C.dark, justifyContent: 'center', alignItems: 'center' }}>
        <Image
          source={require('../assets/app-logo.png')}
          style={{ width: 180, height: 180 }}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="UserHome" component={UserTabNav} />
        <Stack.Screen name="AdminHome" component={AdminTabNav} />
        <Stack.Screen name="Pesan Disini" component={OrderFormScreen} />
        <Stack.Screen name="OrderSummary" component={OrderSummary} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  // ── Frosted glass ─────────────────────────────────────
  glassRoot: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 34,
    overflow: 'hidden',
    elevation: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
  },
  glassTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.96)',
  },
  glassHighlight: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 1,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.95)',
  },

  // ── Icons ─────────────────────────────────────────────
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapInactive: {
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  iconWrapActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
});
