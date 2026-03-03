import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Colors {
  bgPrimary: string;
  bgSecondary: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  border: string;
}

interface ConfigState {
  colors: Colors;
  isDarkMode: boolean;
}

const lightColors: Colors = {
  bgPrimary: '#FFFFFF',
  bgSecondary: '#F5F5F5',
  textPrimary: '#1A1A1A',
  textSecondary: '#666666',
  accent: '#2E7D32',
  border: '#E0E0E0',
};

const darkColors: Colors = {
  bgPrimary: '#1A1A1A',
  bgSecondary: '#2D2D2D',
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B0',
  accent: '#4CAF50',
  border: '#404040',
};

const initialState: ConfigState = {
  colors: lightColors,
  isDarkMode: false,
};

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
      state.colors = state.isDarkMode ? darkColors : lightColors;
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
      state.colors = action.payload ? darkColors : lightColors;
    },
  },
});

export const { toggleDarkMode, setDarkMode } = configSlice.actions;
export default configSlice.reducer;
