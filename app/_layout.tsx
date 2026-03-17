import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import 'react-native-reanimated';

import { store, RootState } from '../store';
import { initializeConfig, ThemeName, TranslationLanguage } from '../store/configSlice';
import '../i18n';

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
        const [savedTheme, savedDarkMode, savedTranslationLang] = await Promise.all([
          AsyncStorage.getItem('theme'),
          AsyncStorage.getItem('isDarkMode'),
          AsyncStorage.getItem('translationLanguage'),
        ]);

        const themeName = (savedTheme as ThemeName) || 'default';
        const isDarkMode = savedDarkMode === 'true';
        const translationLanguage = (savedTranslationLang as TranslationLanguage) || 'bs';

        dispatch(initializeConfig({ themeName, isDarkMode, translationLanguage }));
      } catch (error) {
        console.log('Error loading config:', error);
        dispatch(initializeConfig({ themeName: 'default', isDarkMode: false }));
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
            presentation: 'card',
            title: 'Quran',
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
