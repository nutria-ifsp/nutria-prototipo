import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList, MainTabParamList, PerfilStackParamList } from './src/types/navigation';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { SettingsProvider, useSettings } from './src/context/SettingsContext';
import OnboardingScreen from './src/screens/OnboardingScreen/OnboardingScreen';
import FeedScreen from './src/screens/FeedScreen/FeedScreen';
import LoginScreen from 'screens/LoginScreen/LoginScreen';
import RegisterScreen from 'screens/RegisterScreen/RegisterScreen';
import { Ionicons } from '@expo/vector-icons';
import GruposScreen from 'screens/GruposScreen/GruposScreen';
import PerfilScreen from 'screens/PerfilScreen/PerfilScreen';
import ConfiguracoesScreen from 'screens/ConfiguracoesScreen/ConfiguracoesScreen';
import EditarPerfilScreen from 'screens/EditarPerfilScreen/EditarPerfilScreen';
import CreatePostScreen from 'screens/CreatePostScreen/CreatePostScreen';
import { View, ActivityIndicator } from 'react-native';

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
  const { theme } = useSettings();

  return (
   <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSubtitle,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
        },
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

function RootNavigator() {
  const { isLoggedIn, loading } = useAuth();
  const { theme, loading: settingsLoading, darkMode } = useSettings();

  if (settingsLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer
      theme={{
        dark: darkMode,
        colors: {
          primary: theme.colors.primary,
          background: theme.colors.background,
          card: theme.colors.card,
          text: theme.colors.textStrong,
          border: theme.colors.border,
          notification: theme.colors.danger,
        },
        fonts: {
          regular: { fontFamily: 'System', fontWeight: '400' },
          medium: { fontFamily: 'System', fontWeight: '500' },
          bold: { fontFamily: 'System', fontWeight: '700' },
          heavy: { fontFamily: 'System', fontWeight: '800' },
        },
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen name="CreatePost" component={CreatePostScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </SettingsProvider>
  );
}