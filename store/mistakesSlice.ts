import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';

import { Mistake, MistakeStatistics } from '../types/mistakes';

interface MistakesState {
  mistakes: Mistake[];
  isInitialized: boolean;
}

const initialState: MistakesState = {
  mistakes: [],
  isInitialized: false,
};

const mistakesSlice = createSlice({
  name: 'mistakes',
  initialState,
  reducers: {
    initializeMistakes: (state, action: PayloadAction<Mistake[]>) => {
      state.mistakes = action.payload;
      state.isInitialized = true;
    },
    addMistake: (state, action: PayloadAction<Mistake>) => {
      state.mistakes.unshift(action.payload);
      AsyncStorage.setItem('mistakes', JSON.stringify(state.mistakes));
    },
    deleteMistake: (state, action: PayloadAction<string>) => {
      state.mistakes = state.mistakes.filter((m) => m.id !== action.payload);
      AsyncStorage.setItem('mistakes', JSON.stringify(state.mistakes));
    },
    clearAllMistakes: (state) => {
      state.mistakes = [];
      AsyncStorage.removeItem('mistakes');
    },
  },
});

// Base selector
const selectMistakesState = (state: { mistakes: MistakesState }) => state.mistakes;

export const selectMistakes = createSelector(
  [selectMistakesState],
  (mistakesState) => mistakesState.mistakes
);

export const selectMistakeStatistics = createSelector(
  [selectMistakes],
  (mistakes): MistakeStatistics => {
    const mistakesBySurah: Record<number, { count: number; surahName: string }> = {};

    mistakes.forEach((m) => {
      if (!mistakesBySurah[m.surahNumber]) {
        mistakesBySurah[m.surahNumber] = { count: 0, surahName: m.surahName };
      }
      mistakesBySurah[m.surahNumber].count += 1;
    });

    const mostCommonSurahs = Object.entries(mistakesBySurah)
      .map(([surahNumber, data]) => ({
        surahNumber: Number(surahNumber),
        surahName: data.surahName,
        count: data.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalMistakes: mistakes.length,
      surahsAffected: Object.keys(mistakesBySurah).length,
      mostCommonSurahs,
    };
  }
);

export const { initializeMistakes, addMistake, deleteMistake, clearAllMistakes } =
  mistakesSlice.actions;
export default mistakesSlice.reducer;
