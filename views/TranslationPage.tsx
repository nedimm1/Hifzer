import quranWordsNpm from '@kmaslesa/holy-quran-word-by-word-min';
import quranMetaData from '@kmaslesa/quran-metadata';
import { loadAsync } from 'expo-font';
import React, { memo, useCallback, useEffect, useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  Image,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { quranFonts } from '../data/quranFonts';
import { RootState } from '../store';
import { selectMistakes } from '../store/mistakesSlice';
import { getAyahTranslation, translationLanguages } from '../services/reading';
import chapters from '../data/chapters.json';

const surahTitleImage = require('../assets/images/surah_title.gif');

const { width, height } = Dimensions.get('window');

interface TranslationPageProps {
  page: number;
  onTap?: () => void;
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

interface AyahData {
  surah: number;
  ayah: number;
  arabicText: string;
  translation: string;
  surahName: string;
}

const SurahBanner: React.FC<{ name: string; textColor: string; fontLoaded: boolean }> = ({ name, textColor, fontLoaded }) => {
  return (
    <View style={surahBannerStyles.container}>
      <Image source={surahTitleImage} style={surahBannerStyles.image} resizeMode="stretch" />
      <Text
        style={[
          surahBannerStyles.text,
          { color: textColor, fontFamily: fontLoaded ? 'Arabic' : undefined }
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.5}
      >
        {name}
      </Text>
    </View>
  );
};

const surahBannerStyles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    height: 44,
  },
  image: {
    width: width - 32,
    height: 44,
    position: 'absolute',
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 50,
    width: width - 32,
    lineHeight: 28,
  },
});

const TranslationPage: React.FC<TranslationPageProps> = ({
  page,
  onTap,
}) => {
  const { t } = useTranslation();
  const [quranWords, setQuranWords] = useState<QuranWords | undefined>();
  const [isLoading, setLoading] = useState(true);
  const [arabicFontLoaded, setArabicFontLoaded] = useState(false);
  const [ayahsData, setAyahsData] = useState<AyahData[]>([]);
  const [translationsLoading, setTranslationsLoading] = useState(true);
  const { colors, translationLanguage } = useSelector((state: RootState) => state.config);
  const allMistakes = useSelector(selectMistakes);

  // Create a map of ayahKey -> Set of word indices that have mistakes
  const wordsWithMistakes = useMemo(() => {
    const mistakeMap = new Map<string, Set<number>>();
    allMistakes.forEach((m) => {
      const ayahKey = `${m.surahNumber}:${m.ayahNumber}`;
      if (!mistakeMap.has(ayahKey)) {
        mistakeMap.set(ayahKey, new Set());
      }
      mistakeMap.get(ayahKey)!.add(m.wordIndex);
    });
    return mistakeMap;
  }, [allMistakes]);

  // Track scrolling to differentiate taps from scrolls
  const isScrolling = useRef(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleScrollBegin = useCallback(() => {
    isScrolling.current = true;
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }
  }, []);

  const handleScrollEnd = useCallback(() => {
    scrollTimeout.current = setTimeout(() => {
      isScrolling.current = false;
    }, 100);
  }, []);

  const handleTap = useCallback(() => {
    if (!isScrolling.current && onTap) {
      onTap();
    }
  }, [onTap]);

  const quranTranslation = useMemo(() => {
    return translationLanguages[translationLanguage]?.code || 'bosnian_korkut';
  }, [translationLanguage]);

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

  // Extract unique ayahs from page data
  const uniqueAyahs = useMemo(() => {
    if (!quranWords?.ayahs) return [];

    const ayahSet = new Set<string>();
    const ayahList: { surah: number; ayah: number; isSurahStart: boolean; surahName?: string }[] = [];

    quranWords.ayahs.forEach((line) => {
      // Track surah starts
      if (line.metaData?.lineType === 'start_sura') {
        const nextLine = quranWords.ayahs?.find(
          (l, idx) => idx > quranWords.ayahs!.indexOf(line) && l.words && l.words.length > 0
        );
        if (nextLine?.words?.[0]) {
          const [surah] = nextLine.words[0].ayahKey.split(':').map(Number);
          const chapter = (chapters as any[]).find((c) => c.index.includes(String(surah).padStart(3, '0')));
          ayahList.push({
            surah,
            ayah: 0, // marker for surah start
            isSurahStart: true,
            surahName: chapter?.titleAr || '',
          });
        }
      }

      if (line.words) {
        line.words.forEach((word) => {
          if (!ayahSet.has(word.ayahKey)) {
            ayahSet.add(word.ayahKey);
            const [surah, ayah] = word.ayahKey.split(':').map(Number);
            ayahList.push({ surah, ayah, isSurahStart: false });
          }
        });
      }
    });

    return ayahList;
  }, [quranWords]);

  // Fetch translations for all ayahs on the page
  useEffect(() => {
    const fetchTranslations = async () => {
      if (uniqueAyahs.length === 0) return;

      setTranslationsLoading(true);
      const results: AyahData[] = [];

      for (const item of uniqueAyahs) {
        if (item.isSurahStart) {
          results.push({
            surah: item.surah,
            ayah: 0,
            arabicText: '',
            translation: '',
            surahName: item.surahName || '',
          });
          continue;
        }

        try {
          const response = await getAyahTranslation({
            surah: item.surah,
            ayah: item.ayah,
            translation: quranTranslation,
          });

          if (response.result) {
            const chapter = (chapters as any[]).find((c) =>
              c.index.includes(String(item.surah).padStart(3, '0'))
            );

            results.push({
              surah: item.surah,
              ayah: item.ayah,
              arabicText: response.result.arabic_text,
              translation: response.result.translation,
              surahName: chapter?.titleAr ? `سورة ${chapter.titleAr}` : '',
            });
          }
        } catch (error) {
          console.error('Error fetching translation:', error);
        }
      }

      setAyahsData(results);
      setTranslationsLoading(false);
    };

    fetchTranslations();
  }, [uniqueAyahs, quranTranslation]);

  if (isLoading || translationsLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: colors.bgPrimary }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          {t('quranPage.loadingTranslation')}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
        directionalLockEnabled={true}
        scrollEventThrottle={16}
        onScrollBeginDrag={handleScrollBegin}
        onScrollEndDrag={handleScrollEnd}
        onMomentumScrollEnd={handleScrollEnd}
        onTouchEnd={handleTap}
      >
        {ayahsData.map((ayah, index) => {
          // Surah start banner
          if (ayah.ayah === 0) {
            return (
              <SurahBanner
                key={`surah-${ayah.surah}-${index}`}
                name={`سورة ${ayah.surahName}`}
                textColor={colors.textPrimary}
                fontLoaded={arabicFontLoaded}
              />
            );
          }

          const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
          const ayahNumberArabic = String(ayah.ayah)
            .split('')
            .map(digit => arabicNumerals[parseInt(digit)])
            .join('');

          const ayahKey = `${ayah.surah}:${ayah.ayah}`;
          const mistakeIndices = wordsWithMistakes.get(ayahKey);
          const arabicWords = ayah.arabicText.split(' ');

          return (
            <View
              key={`ayah-${ayah.surah}:${ayah.ayah}`}
              style={[styles.ayahContainer, { backgroundColor: colors.bgSecondary }]}
            >
              <Text
                style={[
                  styles.arabicText,
                  {
                    color: colors.textPrimary,
                    fontFamily: arabicFontLoaded ? 'Arabic' : undefined,
                  }
                ]}
              >
                {arabicWords.map((word, index) => (
                  <Text
                    key={index}
                    style={mistakeIndices?.has(index) ? { color: colors.danger } : undefined}
                  >
                    {word}{index < arabicWords.length - 1 ? ' ' : ''}
                  </Text>
                ))}{ayahNumberArabic}
              </Text>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <Text style={[styles.translationText, { color: colors.textSecondary }]}>
                {ayah.translation}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingBottom: 20,
  },
  ayahContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  arabicText: {
    fontSize: 24,
    lineHeight: 42,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  translationText: {
    fontSize: 16,
    lineHeight: 26,
  },
});

export default memo(TranslationPage);
