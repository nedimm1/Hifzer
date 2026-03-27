import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, BackHandler, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { loadAsync } from 'expo-font';
import quranMetaData from '@kmaslesa/quran-metadata';

import { RootState } from '../store';
import QuranPages from '../views/QuranPages';
import { quranFonts } from '../data/quranFonts';

export default function QuranPagesScreen() {
  const { page } = useLocalSearchParams<{ page: string }>();
  const router = useRouter();
  const { colors } = useSelector((state: RootState) => state.config);
  const insets = useSafeAreaInsets();
  const [selectedAyah, setSelectedAyah] = useState<string | null>(null);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [headerAnim] = useState(new Animated.Value(0));
  const [currentPage, setCurrentPage] = useState<number>(Number(page) || 1);
  const [arabicFontLoaded, setArabicFontLoaded] = useState(false);

  const surahs = quranMetaData.getSuraByPageNumber(currentPage);
  const surahNameArabic = surahs?.[0]?.name?.arabic || '';
  const surahNameEnglish = surahs?.[0]?.name?.english || '';
  const juz = quranMetaData.getJuzByPageNumber(currentPage);

  useEffect(() => {
    const loadArabicFont = async () => {
      try {
        await loadAsync({ Arabic: quranFonts.Arabic });
        setArabicFontLoaded(true);
      } catch {
        setArabicFontLoaded(true);
      }
    };
    loadArabicFont();
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

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
    outputRange: [-(insets.top + 90), 0],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <StatusBar
        barStyle={colors.style === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* Animated Header with Back Button and Surah Name */}
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

        <View style={styles.headerCenter}>
          <Text
            style={[
              styles.headerTitle,
              { color: colors.textPrimary, fontFamily: arabicFontLoaded ? 'Arabic' : undefined }
            ]}
          >
            سورة {surahNameArabic}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {surahNameEnglish}
          </Text>
          <View style={styles.headerInfo}>
            <Text style={[styles.headerInfoText, { color: colors.textSecondary }]}>
              Juz {juz?.id || 1}
            </Text>
            <View style={[styles.headerDot, { backgroundColor: colors.textSecondary }]} />
            <Text style={[styles.headerInfoText, { color: colors.textSecondary }]}>
              Page {currentPage}
            </Text>
          </View>
        </View>

        <View style={styles.headerBackButton} />
      </Animated.View>

      <QuranPages
        route={{ params: { page: Number(page) } }}
        selectedAyah={selectedAyah}
        setSelectedAyah={setSelectedAyah}
        onTap={toggleHeader}
        onPageChange={handlePageChange}
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
    justifyContent: 'space-between',
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 8,
  },
  headerInfoText: {
    fontSize: 12,
    fontWeight: '500',
  },
  headerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
