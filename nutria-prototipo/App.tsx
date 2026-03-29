import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList, MainTabParamList, PerfilStackParamList } from './src/types/navigation';
import OnboardingScreen from './src/screens/OnboardingScreen/OnboardingScreen';
import FeedScreen from './src/screens/FeedScreen/FeedScreen';
import { theme } from './src/styles/theme';
import LoginScreen from 'screens/LoginScreen/LoginScreen';
import RegisterScreen from 'screens/RegisterScreen/RegisterScreen';
import { Ionicons } from '@expo/vector-icons';
import GruposScreen from 'screens/GruposScreen/GruposScreen';
import PerfilScreen from 'screens/PerfilScreen/PerfilScreen';
import ConfiguracoesScreen from 'screens/ConfiguracoesScreen/ConfiguracoesScreen';
import EditarPerfilScreen from 'screens/EditarPerfilScreen/EditarPerfilScreen';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const PerfilStack = createStackNavigator<PerfilStackParamList>();

function PerfilStackNavigator() {
  return (
    <PerfilStack.Navigator screenOptions={{ headerShown: false }}>
      <PerfilStack.Screen name="PerfilMain" component={PerfilScreen} />
      <PerfilStack.Screen name="EditarPerfil" component={EditarPerfilScreen} />
      <PerfilStack.Screen name="Configuracoes" component={ConfiguracoesScreen} />
    </PerfilStack.Navigator>
  );
}

function TabNavigator() {
  return (
   <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        animation: 'shift',
      }}
    >
    <Tab.Screen 
      name="Feed" 
      component={FeedScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="home" size={size} color={color} />
        ),
        headerShown: false,
      }}
    />
    <Tab.Screen 
      name="Grupos" 
      component={GruposScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="people" size={size} color={color} />
        ),
        headerShown: false,
      }}
    />
    <Tab.Screen 
      name="Perfil" 
      component={PerfilStackNavigator}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="person" size={size} color={color} />
        ),
        headerShown: false,
      }}
    />
  </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="MainTabs" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}