import { configureStore } from '@reduxjs/toolkit';
import configReducer from './configSlice';
import mistakesReducer from './mistakesSlice';

export const store = configureStore({
  reducer: {
    config: configReducer,
    mistakes: mistakesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
