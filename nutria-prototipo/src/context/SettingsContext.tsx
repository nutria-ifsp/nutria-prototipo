import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkTheme, lightTheme } from '../styles/theme';

const DARK_MODE_STORAGE_KEY = 'darkModeEnabled';

type AppTheme = typeof lightTheme;

interface SettingsContextType {
  darkMode: boolean;
  theme: AppTheme;
  loading: boolean;
  setDarkMode: (enabled: boolean) => Promise<void>;
  toggleDarkMode: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [darkMode, setDarkModeState] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const raw = await AsyncStorage.getItem(DARK_MODE_STORAGE_KEY);
        if (raw !== null) {
          setDarkModeState(raw === 'true');
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const setDarkMode = async (enabled: boolean) => {
    setDarkModeState(enabled);
    try {
      await AsyncStorage.setItem(DARK_MODE_STORAGE_KEY, String(enabled));
    } catch (error) {
      console.error('Failed to persist dark mode setting:', error);
    }
  };

  const toggleDarkMode = async () => {
    await setDarkMode(!darkMode);
  };

  const theme = useMemo(() => (darkMode ? darkTheme : lightTheme), [darkMode]);

  return (
    <SettingsContext.Provider
      value={{
        darkMode,
        theme,
        loading,
        setDarkMode,
        toggleDarkMode,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
