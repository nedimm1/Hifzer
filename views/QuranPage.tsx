import quranWordsNpm from '@kmaslesa/holy-quran-word-by-word-min';
import { loadAsync } from 'expo-font';
import React, { memo, useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ImageBackground,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';

import { quranFonts } from '../data/quranFonts';
import { RootState } from '../store';

const surahTitleImage = require('../assets/images/surah_title.gif');
const BISMILLAH = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';

const { width, height } = Dimensions.get('window');

interface QuranPageProps {
  page: number;
  selectedAyah: string | null;
  setSelectedAyah: (ayah: string | null) => void;
}

interface Word {
  codeV1: string;
  ayahKey: string;
}

interface LineData {
  metaData?: {
    lineType?: string;
    suraName?: string;
  };
  words?: Word[];
}

interface QuranWords {
  ayahs?: LineData[];
}

// Decorative Surah Banner Component using surah_title.gif
const SurahBanner: React.FC<{ name: string; textColor: string }> = ({ name, textColor }) => {
  return (
    <View style={surahBannerStyles.container}>
      <ImageBackground
        source={surahTitleImage}
        style={surahBannerStyles.imageBackground}
        resizeMode="stretch"
      >
        <Text style={[surahBannerStyles.text, { color: textColor }]}>{name}</Text>
      </ImageBackground>
    </View>
  );
};

const surahBannerStyles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
  },
  imageBackground: {
    width: '100%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});

const QuranPage: React.FC<QuranPageProps> = ({
  page,
  selectedAyah,
  setSelectedAyah,
}) => {
  const [quranWords, setQuranWords] = useState<QuranWords | undefined>();
  const [isLoading, setLoading] = useState(true);
  const [arabicFontLoaded, setArabicFontLoaded] = useState(false);
  const { colors } = useSelector((state: RootState) => state.config);

  // Load Arabic font for bismillah
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

  const getQuranWordsforPage = useCallback(async () => {
    setLoading(true);
    try {
      const key = `p${page}`;
      if (quranFonts[key]) {
        await loadAsync({ [key]: quranFonts[key] });
      }
      const data = await quranWordsNpm.getWordsByPage(page);
      setQuranWords(data);
    } catch (error) {
      console.error('Error loading Quran page:', error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    getQuranWordsforPage();
  }, [getQuranWordsforPage]);

  const fontKey = `p${page}`;
  const hasCustomFont = !!quranFonts[fontKey];

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: colors.bgPrimary }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      {/* Page Content - Single pass rendering */}
      <View style={[
        styles.pageContent,
        (page === 1 || page === 2) && styles.pageContentCentered
      ]}>
        {quranWords?.ayahs?.map((line, lineIndex) => {
          // Surah Banner
          if (line.metaData?.lineType === 'start_sura') {
            const surahName = line.metaData?.suraName || '';
            return (
              <View key={`line-${lineIndex}`}>
                <SurahBanner name={surahName} textColor={colors.textPrimary} />
              </View>
            );
          }

          // Bismillah
          if (line.metaData?.lineType === 'besmellah') {
            return (
              <View key={`line-${lineIndex}`} style={styles.bismillahContainer}>
                <Text
                  style={[
                    styles.bismillahText,
                    {
                      color: colors.textPrimary,
                      fontFamily: arabicFontLoaded ? 'Arabic' : undefined,
                    },
                  ]}
                >
                  {BISMILLAH}
                </Text>
              </View>
            );
          }

          // Verse line
          if (line.words && line.words.length > 0) {
            return (
              <View key={`line-${lineIndex}`} style={styles.lineContainer}>
                <Text
                  style={[
                    styles.lineText,
                    {
                      fontFamily: hasCustomFont ? fontKey : undefined,
                      color: colors.textPrimary,
                    },
                  ]}
                >
                  {line.words.map((word, wordIndex) => {
                    const isWordSelected = selectedAyah === word.ayahKey;
                    return (
                      <Text
                        key={`word-${lineIndex}-${wordIndex}`}
                        onPress={() => {
                          setSelectedAyah(isWordSelected ? null : word.ayahKey);
                        }}
                        style={isWordSelected ? { color: colors.accent } : undefined}
                      >
                        {word.codeV1}
                      </Text>
                    );
                  })}
                </Text>
              </View>
            );
          }

          return null;
        })}
      </View>

      {/* Page Number */}
      <View style={[styles.pageNumberContainer, { borderTopColor: colors.border }]}>
        <Text style={[styles.pageNumber, { color: colors.textSecondary }]}>
          {page}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width,
    height,
    paddingTop: 50,
    paddingBottom: 10,
    paddingHorizontal: 8,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageContent: {
    flex: 1,
    paddingVertical: 4,
    justifyContent: 'space-between',
  },
  pageContentCentered: {
    justifyContent: 'center',
  },
  bismillahContainer: {
    width: '100%',
    alignItems: 'center',
  },
  bismillahText: {
    fontSize: 22,
    textAlign: 'center',
    marginVertical: 6,
    writingDirection: 'rtl',
  },
  lineContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 32,
  },
  lineText: {
    fontSize: 22,
    textAlign: 'center',
    writingDirection: 'rtl',
    includeFontPadding: false,
  },
  pageNumberContainer: {
    alignItems: 'center',
    paddingTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 4,
  },
  pageNumber: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default memo(QuranPage);
