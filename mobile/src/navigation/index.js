import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/main/HomeScreen';
import ExploreScreen from '../screens/main/ExploreScreen';
import EventsScreen from '../screens/main/EventsScreen';
import ProfessionalsScreen from '../screens/main/ProfessionalsScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import LocalDetailScreen from '../screens/detail/LocalDetailScreen';
import ProfessionalDetailScreen from '../screens/detail/ProfessionalDetailScreen';

import { colors } from '../theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Inicio:        { active: 'home',          inactive: 'home-outline' },
  Explorar:      { active: 'search',        inactive: 'search-outline' },
  Eventos:       { active: 'calendar',      inactive: 'calendar-outline' },
  Profesionales: { active: 'people',        inactive: 'people-outline' },
  Perfil:        { active: 'person',        inactive: 'person-outline' },
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0D0D0D',
          borderTopColor: 'rgba(250,204,21,0.15)',
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 9,
          paddingTop: 7,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name] || { active: 'apps', inactive: 'apps-outline' };
          return (
            <Ionicons
              name={focused ? icons.active : icons.inactive}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Inicio"        component={HomeScreen} />
      <Tab.Screen name="Explorar"      component={ExploreScreen} />
      <Tab.Screen name="Eventos"       component={EventsScreen} />
      <Tab.Screen name="Profesionales" component={ProfessionalsScreen} />
      <Tab.Screen name="Perfil"        component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Main"              component={MainTabs} />
        <Stack.Screen name="Login"             component={LoginScreen} />
        <Stack.Screen name="Register"          component={RegisterScreen} />
        <Stack.Screen name="LocalDetalle"      component={LocalDetailScreen} />
        <Stack.Screen name="ProfesionalDetalle" component={ProfessionalDetailScreen} />
        <Stack.Screen name="Notificaciones"    component={NotificationsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
