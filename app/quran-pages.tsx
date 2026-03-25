import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, StatusBar, BackHandler } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../store';
import QuranPages from '../views/QuranPages';

export default function QuranPagesScreen() {
  const { page } = useLocalSearchParams<{ page: string }>();
  const router = useRouter();
  const { colors } = useSelector((state: RootState) => state.config);
  const insets = useSafeAreaInsets();
  const [selectedAyah, setSelectedAyah] = useState<string | null>(null);

  const handleBackPress = useCallback(() => {
    if (selectedAyah) {
      // If an ayah is selected, unselect it first
      setSelectedAyah(null);
      return true; // Prevent default back behavior
    }
    return false; // Allow default back behavior
  }, [selectedAyah]);

  // Handle Android hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => backHandler.remove();
  }, [handleBackPress]);

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <StatusBar
        barStyle={colors.style === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* Back Button - Positioned in safe area */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={[
          styles.backButton,
          {
            top: insets.top + 8,
            backgroundColor: colors.bgSecondary,
          },
        ]}
      >
        <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
      </TouchableOpacity>

      <QuranPages
        route={{ params: { page: Number(page) } }}
        selectedAyah={selectedAyah}
        setSelectedAyah={setSelectedAyah}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    zIndex: 100,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
