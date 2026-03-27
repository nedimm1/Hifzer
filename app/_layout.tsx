import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import 'react-native-reanimated';

import { store, RootState } from '../store';
import { initializeConfig, ThemeName, TranslationLanguage, AppLanguage } from '../store/configSlice';
import { initializeMistakes } from '../store/mistakesSlice';
import i18n, { changeLanguage } from '../i18n';

export const unstable_settings = {
  anchor: '(tabs)',
};

const queryClient = new QueryClient();

function AppContent() {
  const dispatch = useDispatch();
  const { colors } = useSelector((state: RootState) => state.config);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const [savedTheme, savedDarkMode, savedTranslationLang, savedAppLang, savedMistakes] = await Promise.all([
          AsyncStorage.getItem('theme'),
          AsyncStorage.getItem('isDarkMode'),
          AsyncStorage.getItem('translationLanguage'),
          AsyncStorage.getItem('appLanguage'),
          AsyncStorage.getItem('mistakes'),
        ]);

        const themeName = (savedTheme as ThemeName) || 'default';
        const isDarkMode = savedDarkMode === 'true';
        const translationLanguage = (savedTranslationLang as TranslationLanguage) || 'bs';
        const appLanguage = (savedAppLang as AppLanguage) || 'en';
        const mistakes = savedMistakes ? JSON.parse(savedMistakes) : [];

        // Set i18n language
        changeLanguage(appLanguage);

        dispatch(initializeConfig({ themeName, isDarkMode, translationLanguage, appLanguage }));
        dispatch(initializeMistakes(mistakes));
      } catch (error) {
        console.log('Error loading config:', error);
        dispatch(initializeConfig({ themeName: 'default', isDarkMode: false }));
        dispatch(initializeMistakes([]));
      }
    };

    loadConfig();
  }, [dispatch]);

  const navigationTheme = colors.style === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <ThemeProvider value={navigationTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="quran-pages"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="selected-ayah"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style={colors.style === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </Provider>
  );
}
