import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, StatusBar, BackHandler, Animated } from 'react-native';
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
  const [headerVisible, setHeaderVisible] = useState(false);
  const [headerAnim] = useState(new Animated.Value(0));

  const toggleHeader = useCallback(() => {
    const toValue = headerVisible ? 0 : 1;
    setHeaderVisible(!headerVisible);
    Animated.timing(headerAnim, {
      toValue,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [headerVisible, headerAnim]);

  const handleBackPress = useCallback(() => {
    if (selectedAyah) {
      setSelectedAyah(null);
      return true;
    }
    if (headerVisible) {
      toggleHeader();
      return true;
    }
    return false;
  }, [selectedAyah, headerVisible, toggleHeader]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => backHandler.remove();
  }, [handleBackPress]);

  const headerTranslateY = headerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-(insets.top + 60), 0],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <StatusBar
        barStyle={colors.style === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* Animated Header with Back Button */}
      <Animated.View
        style={[
          styles.header,
          {
            paddingTop: insets.top,
            backgroundColor: colors.bgSecondary,
            transform: [{ translateY: headerTranslateY }],
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </Animated.View>

      <QuranPages
        route={{ params: { page: Number(page) } }}
        selectedAyah={selectedAyah}
        setSelectedAyah={setSelectedAyah}
        onTap={toggleHeader}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 12,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
