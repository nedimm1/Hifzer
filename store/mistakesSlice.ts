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
    updateMistakeNote: (state, action: PayloadAction<{ id: string; note: string }>) => {
      const mistake = state.mistakes.find((m) => m.id === action.payload.id);
      if (mistake) {
        mistake.note = action.payload.note;
        AsyncStorage.setItem('mistakes', JSON.stringify(state.mistakes));
      }
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

// Selector for mistakes grouped by surah
export const selectMistakesGroupedBySurah = createSelector(
  [selectMistakes],
  (mistakes) => {
    const grouped: Record<number, { surahName: string; surahNumber: number; mistakes: Mistake[] }> = {};

    mistakes.forEach((m) => {
      if (!grouped[m.surahNumber]) {
        grouped[m.surahNumber] = {
          surahName: m.surahName,
          surahNumber: m.surahNumber,
          mistakes: [],
        };
      }
      grouped[m.surahNumber].mistakes.push(m);
    });

    // Sort by surah number and return as array
    return Object.values(grouped).sort((a, b) => a.surahNumber - b.surahNumber);
  }
);

export const { initializeMistakes, addMistake, deleteMistake, updateMistakeNote, clearAllMistakes } =
  mistakesSlice.actions;
export default mistakesSlice.reducer;
