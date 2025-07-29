// src/navigation/index.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View } from 'react-native';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import SupportScreen from '../screens/auth/SupportScreen';
import HomeScreen from '../screens/cambios/HomeScreen';
import CambioDetailScreen from '../screens/cambios/CambioDetailScreen';
import AddCambioScreen from '../screens/cambios/AddCambioScreen';
import EditCambioScreen from '../screens/cambios/EditCambioScreen';
import SearchCambioScreen from '../screens/cambios/SearchCambioScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

import ServiciosPendientesScreen from '../screens/cambios/ServiciosPendientesScreen';
import CompletarServicioScreen from '../screens/cambios/CompletarServicioScreen';

// Hooks
import useAuth from '../hooks/useAuth';

// Theme
import { colors } from '../styles/theme';

// Types
import { CambioAceite } from '../interfaces';

// Stack Navigators Types
export type AuthStackParamList = {
  Login: undefined;
  Support: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  CambioDetail: { cambioId: string };
  AddCambio: undefined;
  EditCambio: { cambio: CambioAceite };
  SearchCambio: undefined;
  ServiciosPendientes: undefined;
  CompletarServicio: { cambio: CambioAceite };
};

export type ProfileStackParamList = {
  Profile: undefined;
};

// Tab Navigator Type
export type MainTabParamList = {
  HomeStack: undefined;
  ProfileStack: undefined;
};

// Create navigators
const AuthStack = createStackNavigator<AuthStackParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

// Auth Stack Navigator
const AuthNavigator = () => (
  <AuthStack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: colors.primary,
      },
      headerTintColor: 'white',
    }}
  >
    <AuthStack.Screen 
      name="Login" 
      component={LoginScreen} 
      options={{ title: 'Iniciar Sesión' }} 
    />
    <AuthStack.Screen 
      name="Support" 
      component={SupportScreen} 
      options={{ title: 'Soporte' }} 
    />
  </AuthStack.Navigator>
);


// Home Stack Navigator
const HomeStackNavigator = () => (
  <HomeStack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: colors.primary,
      },
      headerTintColor: 'white',
    }}
  >
    <HomeStack.Screen 
      name="Home" 
      component={HomeScreen} 
      options={{ title: 'Cambios de Aceite' }} 
    />
    <HomeStack.Screen 
      name="CambioDetail" 
      component={CambioDetailScreen} 
      options={{ title: 'Detalle de Cambio' }} 
    />
    <HomeStack.Screen 
      name="AddCambio" 
      component={AddCambioScreen} 
      options={{ title: 'Nuevo Cambio de Aceite' }} 
    />
    <HomeStack.Screen 
      name="EditCambio" 
      component={EditCambioScreen} 
      options={{ title: 'Editar Cambio de Aceite' }} 
    />
    <HomeStack.Screen 
      name="SearchCambio" 
      component={SearchCambioScreen} 
      options={{ title: 'Buscar Cambio' }} 
    />
    {/* NUEVAS PANTALLAS */}
    <HomeStack.Screen 
      name="ServiciosPendientes" 
      component={ServiciosPendientesScreen} 
      options={{ title: 'Servicios Pendientes' }} 
    />
    <HomeStack.Screen 
      name="CompletarServicio" 
      component={CompletarServicioScreen} 
      options={{ title: 'Completar Servicio' }} 
    />
  </HomeStack.Navigator>
);

// Profile Stack Navigator
const ProfileStackNavigator = () => (
  <ProfileStack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: colors.primary,
      },
      headerTintColor: 'white',
    }}
  >
    <ProfileStack.Screen 
      name="Profile" 
      component={ProfileScreen} 
      options={{ title: 'Mi Perfil' }} 
    />
  </ProfileStack.Navigator>
);

// Main Tab Navigator
const MainTabNavigator = () => (
  <MainTab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: any;

        if (route.name === 'HomeStack') {
          iconName = focused ? 'water' : 'water-outline';
        } else if (route.name === 'ProfileStack') {
          iconName = focused ? 'person' : 'person-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textLight,
      headerShown: false,
    })}
  >
    <MainTab.Screen 
      name="HomeStack" 
      component={HomeStackNavigator} 
      options={{ title: 'Cambios' }} 
    />
    <MainTab.Screen 
      name="ProfileStack" 
      component={ProfileStackNavigator} 
      options={{ title: 'Perfil' }} 
    />
  </MainTab.Navigator>
);

// Root Navigator
const AppNavigator = () => {
  const { authState } = useAuth();
  const { isLoading, user, lubricentro, error } = authState;

  // Si está cargando, mostrar un indicador de carga
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user && lubricentro ? (
        // Usuario autenticado y lubricentro activo
        <MainTabNavigator />
      ) : (
        // No autenticado o lubricentro inactivo
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;