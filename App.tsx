import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList, MainTabParamList } from './src/types/navigation';
import OnboardingScreen from './src/screens/OnboardingScreen/OnboardingScreen';
import FeedScreen from './src/screens/FeedScreen/FeedScreen';
import { theme } from './src/styles/theme';
import LoginScreen from 'screens/LoginScreen/LoginScreen';
import RegisterScreen from 'screens/RegisterScreen/RegisterScreen';
import { Ionicons } from '@expo/vector-icons';
import GruposScreen from 'screens/GruposScreen/GruposScreen';
import PerfilScreen from 'screens/PerfilScreen/PerfilScreen';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function TabNavigator() {
  return (
   <Tab.Navigator screenOptions={{ tabBarActiveTintColor: theme.colors.primary }}>
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
      component={PerfilScreen}
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