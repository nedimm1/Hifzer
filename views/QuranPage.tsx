import quranMetaData from '@kmaslesa/quran-metadata';
import quranWordsNpm from '@kmaslesa/holy-quran-word-by-word-min';
import { loadAsync } from 'expo-font';
import React, { memo, useCallback, useEffect, useState, useMemo } from 'react';
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
const SurahBanner: React.FC<{ name: string }> = ({ name }) => {
  return (
    <View style={surahBannerStyles.container}>
      <ImageBackground
        source={surahTitleImage}
        style={surahBannerStyles.imageBackground}
        resizeMode="stretch"
      >
        <Text style={surahBannerStyles.text}>{name}</Text>
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
    color: '#000000',
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

  // Get page metadata
  const pageInfo = useMemo(() => {
    try {
      const suraData = quranMetaData.getSuraByPageNumber(page) as unknown as Record<string, unknown> | null;
      const juzData = quranMetaData.getJuzByPageNumber(page) as unknown as Record<string, unknown> | number | null;

      // Handle different possible return structures
      let suraName = '';
      if (suraData && typeof suraData === 'object') {
        const nameObj = suraData.name as Record<string, string> | undefined;
        suraName = nameObj?.englishTranscription ||
                   (suraData.englishTranscription as string) ||
                   nameObj?.english ||
                   '';
      }

      let juzNumber = Math.ceil(page / 20);
      if (juzData) {
        if (typeof juzData === 'number') {
          juzNumber = juzData;
        } else if (typeof juzData === 'object') {
          juzNumber = (juzData.index as number) || (juzData.juz as number) || Math.ceil(page / 20);
        }
      }

      return { suraName, juzNumber };
    } catch {
      return { suraName: '', juzNumber: Math.ceil(page / 20) };
    }
  }, [page]);

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

  // Extract surah name from page data if not available from metadata
  const displaySuraName = useMemo(() => {
    if (pageInfo.suraName) return pageInfo.suraName;

    // Try to find it from the first start_sura line
    const startSuraLine = quranWords?.ayahs?.find(
      (line) => line.metaData?.lineType === 'start_sura'
    );
    if (startSuraLine?.metaData?.suraName) {
      return startSuraLine.metaData.suraName;
    }

    return '';
  }, [pageInfo.suraName, quranWords]);

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
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerText, { color: colors.textSecondary }]}>
          {displaySuraName ? displaySuraName : `Page ${page}`}
        </Text>
        <Text style={[styles.headerText, { color: colors.textSecondary }]}>
          Juz {pageInfo.juzNumber}
        </Text>
      </View>

      {/* Page Content */}
      <View style={styles.pageContent}>
        {/* Render surah banners first (stick to top) */}
        {quranWords?.ayahs?.map((line, lineIndex) => {
          if (line.metaData?.lineType === 'start_sura') {
            const surahName = line.metaData?.suraName || '';
            const isFatiha = surahName.toLowerCase().includes('fatiha') ||
                            surahName.toLowerCase().includes('faatiha') ||
                            surahName.includes('الفاتحة');
            const isTawbah = surahName.toLowerCase().includes('tawbah') ||
                            surahName.toLowerCase().includes('tawba') ||
                            surahName.includes('التوبة');

            return (
              <View key={`surah-${lineIndex}`}>
                <SurahBanner name={surahName} />
                {!isFatiha && !isTawbah && (
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
                )}
              </View>
            );
          }
          return null;
        })}

        {/* Verses container - centered for pages 1 and 2 */}
        <View style={[
          styles.versesContainer,
          (page === 1 || page === 2) && styles.versesContainerCentered
        ]}>
          {quranWords?.ayahs?.map((line, lineIndex) => {
            // Skip surah banners and bismillah (already rendered above)
            if (line.metaData?.lineType === 'start_sura') return null;
            if (line.metaData?.lineType === 'besmellah') return null;

            // Regular line - render with nested Text for word-level selection
            if (!line.words || line.words.length === 0) return null;

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
          })}
        </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 4,
  },
  headerText: {
    fontSize: 12,
    fontWeight: '500',
  },
  pageContent: {
    flex: 1,
    paddingVertical: 4,
  },
  versesContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  versesContainerCentered: {
    justifyContent: 'center',
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
