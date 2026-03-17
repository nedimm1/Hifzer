import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Colors {
  bgPrimary: string;
  bgSecondary: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentLight: string;
  border: string;
  shadow: string;
  danger: string;
  success: string;
  style: 'light' | 'dark';
}

export type ThemeName = 'default' | 'mecca' | 'medina' | 'palestine' | 'alAqsa';

interface ThemeVariants {
  light: Colors;
  dark: Colors;
}

// Default Theme - Classic Green (Current)
const defaultTheme: ThemeVariants = {
  light: {
    bgPrimary: '#FFFFFF',
    bgSecondary: '#F5F5F5',
    textPrimary: '#1A1A1A',
    textSecondary: '#666666',
    accent: '#2E7D32',
    accentLight: '#4CAF50',
    border: '#E0E0E0',
    shadow: '#000000',
    danger: '#D32F2F',
    success: '#2E7D32',
    style: 'light',
  },
  dark: {
    bgPrimary: '#1A1A1A',
    bgSecondary: '#2D2D2D',
    textPrimary: '#FFFFFF',
    textSecondary: '#B0B0B0',
    accent: '#4CAF50',
    accentLight: '#81C784',
    border: '#404040',
    shadow: '#000000',
    danger: '#EF5350',
    success: '#4CAF50',
    style: 'dark',
  },
};

// Mecca Theme - Gold & Black (Kaaba inspired)
const meccaTheme: ThemeVariants = {
  light: {
    bgPrimary: '#FFF8E7',
    bgSecondary: '#FFF3D6',
    textPrimary: '#1A1408',
    textSecondary: '#5C4A1F',
    accent: '#D4AF37',
    accentLight: '#F4D03F',
    border: '#E6D5A8',
    shadow: '#8B7355',
    danger: '#C0392B',
    success: '#27AE60',
    style: 'light',
  },
  dark: {
    bgPrimary: '#0D0D0D',
    bgSecondary: '#1A1A1A',
    textPrimary: '#F5F5F5',
    textSecondary: '#B0A080',
    accent: '#D4AF37',
    accentLight: '#F4D03F',
    border: '#333333',
    shadow: '#000000',
    danger: '#E74C3C',
    success: '#2ECC71',
    style: 'dark',
  },
};

// Medina Theme - Islamic Green (Prophet's Mosque inspired)
const medinaTheme: ThemeVariants = {
  light: {
    bgPrimary: '#F0FFF0',
    bgSecondary: '#E8F5E9',
    textPrimary: '#1A1A1A',
    textSecondary: '#2E7D32',
    accent: '#1B5E20',
    accentLight: '#43A047',
    border: '#A5D6A7',
    shadow: '#2E7D32',
    danger: '#C62828',
    success: '#1B5E20',
    style: 'light',
  },
  dark: {
    bgPrimary: '#0A1A0A',
    bgSecondary: '#0F2A0F',
    textPrimary: '#E0F2E0',
    textSecondary: '#81C784',
    accent: '#43A047',
    accentLight: '#66BB6A',
    border: '#1B5E20',
    shadow: '#000000',
    danger: '#EF5350',
    success: '#43A047',
    style: 'dark',
  },
};

// Palestine Theme - Watermelon (Red, Green, Black, White)
const palestineTheme: ThemeVariants = {
  light: {
    bgPrimary: '#FFFFFF',
    bgSecondary: '#FFE5E5',
    textPrimary: '#1B7A3E',
    textSecondary: '#555555',
    accent: '#E63946',
    accentLight: '#FF6B7D',
    border: '#C8E6C9',
    shadow: '#1B7A3E',
    danger: '#E63946',
    success: '#1B7A3E',
    style: 'light',
  },
  dark: {
    bgPrimary: '#1A1A1A',
    bgSecondary: '#2D1F1F',
    textPrimary: '#FFFFFF',
    textSecondary: '#90EE90',
    accent: '#FF6B7D',
    accentLight: '#FF8A9A',
    border: '#404040',
    shadow: '#000000',
    danger: '#FF6B7D',
    success: '#4CAF50',
    style: 'dark',
  },
};

// Al-Aqsa Theme - Orange & Olive (Jerusalem Stone inspired)
const alAqsaTheme: ThemeVariants = {
  light: {
    bgPrimary: '#FFF8DC',
    bgSecondary: '#FFE4B5',
    textPrimary: '#4A4A4A',
    textSecondary: '#6B8E23',
    accent: '#FF8C00',
    accentLight: '#FFA500',
    border: '#D2B48C',
    shadow: '#8B7355',
    danger: '#CD5C5C',
    success: '#6B8E23',
    style: 'light',
  },
  dark: {
    bgPrimary: '#1A1408',
    bgSecondary: '#2A2010',
    textPrimary: '#FFF8DC',
    textSecondary: '#BDB76B',
    accent: '#FF8C00',
    accentLight: '#FFA500',
    border: '#4A4A2A',
    shadow: '#000000',
    danger: '#E9967A',
    success: '#9ACD32',
    style: 'dark',
  },
};

const themes: Record<ThemeName, ThemeVariants> = {
  default: defaultTheme,
  mecca: meccaTheme,
  medina: medinaTheme,
  palestine: palestineTheme,
  alAqsa: alAqsaTheme,
};

export const themeDisplayNames: Record<ThemeName, string> = {
  default: 'Default',
  mecca: 'Mecca',
  medina: 'Medina',
  palestine: 'Palestine',
  alAqsa: 'Al-Aqsa',
};

export type TranslationLanguage = 'en' | 'bs' | 'tr' | 'de' | 'sq';

interface ConfigState {
  colors: Colors;
  isDarkMode: boolean;
  themeName: ThemeName;
  translationLanguage: TranslationLanguage;
  isInitialized: boolean;
}

const initialState: ConfigState = {
  colors: defaultTheme.light,
  isDarkMode: false,
  themeName: 'default',
  translationLanguage: 'bs',
  isInitialized: false,
};

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ThemeName>) => {
      state.themeName = action.payload;
      state.colors = themes[action.payload][state.isDarkMode ? 'dark' : 'light'];
      AsyncStorage.setItem('theme', action.payload);
    },
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
      state.colors = themes[state.themeName][state.isDarkMode ? 'dark' : 'light'];
      AsyncStorage.setItem('isDarkMode', String(state.isDarkMode));
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
      state.colors = themes[state.themeName][action.payload ? 'dark' : 'light'];
      AsyncStorage.setItem('isDarkMode', String(action.payload));
    },
    initializeConfig: (
      state,
      action: PayloadAction<{ themeName: ThemeName; isDarkMode: boolean; translationLanguage?: TranslationLanguage }>
    ) => {
      state.themeName = action.payload.themeName;
      state.isDarkMode = action.payload.isDarkMode;
      state.colors = themes[action.payload.themeName][action.payload.isDarkMode ? 'dark' : 'light'];
      state.translationLanguage = action.payload.translationLanguage || 'bs';
      state.isInitialized = true;
    },
    setTranslationLanguage: (state, action: PayloadAction<TranslationLanguage>) => {
      state.translationLanguage = action.payload;
      AsyncStorage.setItem('translationLanguage', action.payload);
    },
  },
});

export const { setTheme, toggleDarkMode, setDarkMode, initializeConfig, setTranslationLanguage } = configSlice.actions;
export { themes };
export default configSlice.reducer;
