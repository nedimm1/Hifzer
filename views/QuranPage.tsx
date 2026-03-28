import quranWordsNpm from '@kmaslesa/holy-quran-word-by-word-min';
import { loadAsync } from 'expo-font';
import React, { memo, useCallback, useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';

import { quranFonts } from '../data/quranFonts';
import { RootState } from '../store';
import { selectMistakes } from '../store/mistakesSlice';
import chapters from '../data/chapters.json';

const surahTitleImage = require('../assets/images/surah_title.gif');

// Helper to normalize surah name for comparison
const normalizeName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z]/g, '');
};

// Remove common Arabic article prefixes (Al-, An-, Ar-, As-, At-, Ad-, Az-, Ash-, Aal-, Ali-)
const removeArticle = (name: string): string => {
  return name.replace(/^(aal|ali|al|an|ar|as|at|ad|az|ash)/, '');
};

// Helper to check if string contains Arabic characters
const containsArabic = (str: string): boolean => {
  return /[\u0600-\u06FF]/.test(str);
};

// Helper to extract Arabic part from mixed string like "Et-Tevbe - التوبة"
const extractArabicName = (name: string): string | null => {
  // If the string contains " - " separator and has Arabic, extract just the Arabic part
  if (name.includes(' - ') && containsArabic(name)) {
    const parts = name.split(' - ');
    for (const part of parts) {
      if (containsArabic(part)) {
        return part.trim();
      }
    }
  }
  // If the whole string is Arabic, return it
  if (containsArabic(name) && !name.match(/[a-zA-Z]/)) {
    return name;
  }
  return null;
};

// Helper to get Arabic surah name from English name using chapters.json
const getArabicSurahName = (englishName: string): string => {
  // First, check if the input already contains Arabic (mixed format like "Et-Tevbe - التوبة")
  const arabicPart = extractArabicName(englishName);
  if (arabicPart) {
    return arabicPart;
  }

  const normalizedInput = normalizeName(englishName);
  const inputWithoutArticle = removeArticle(normalizedInput);

  // First try exact match
  for (const chapter of chapters) {
    const normalizedTitle = normalizeName(chapter.title);
    if (normalizedTitle === normalizedInput) {
      return chapter.titleAr;
    }
  }

  // Try exact match without articles (handles "Fatiha" vs "Al-Fatiha")
  for (const chapter of chapters) {
    const normalizedTitle = normalizeName(chapter.title);
    const titleWithoutArticle = removeArticle(normalizedTitle);
    if (titleWithoutArticle === inputWithoutArticle && inputWithoutArticle.length >= 3) {
      return chapter.titleAr;
    }
  }

  // Then try: input starts with chapter name or vice versa (for spelling variations at the end)
  for (const chapter of chapters) {
    const normalizedTitle = normalizeName(chapter.title);
    if (normalizedInput.startsWith(normalizedTitle) || normalizedTitle.startsWith(normalizedInput)) {
      return chapter.titleAr;
    }
  }

  // Try startsWith without articles
  for (const chapter of chapters) {
    const normalizedTitle = normalizeName(chapter.title);
    const titleWithoutArticle = removeArticle(normalizedTitle);
    if (inputWithoutArticle.length >= 3 && titleWithoutArticle.length >= 3) {
      if (inputWithoutArticle.startsWith(titleWithoutArticle) || titleWithoutArticle.startsWith(inputWithoutArticle)) {
        return chapter.titleAr;
      }
    }
  }

  // Finally try matching first characters (min 3 for short names, 6 for longer)
  for (const chapter of chapters) {
    const normalizedTitle = normalizeName(chapter.title);
    const minLen = Math.min(normalizedTitle.length, normalizedInput.length);
    // For short names (<=5 chars), require full match of shorter string
    // For longer names, require at least first 6 chars to match
    if (minLen >= 3) {
      const matchLen = minLen <= 5 ? minLen : 6;
      if (normalizedTitle.substring(0, matchLen) === normalizedInput.substring(0, matchLen)) {
        return chapter.titleAr;
      }
    }
  }

  return englishName;
};
const BISMILLAH = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';

const { width, height } = Dimensions.get('window');

interface QuranPageProps {
  page: number;
  selectedAyah: string | null;
  setSelectedAyah: (ayah: string | null) => void;
  onWordSelect?: (ayahKey: string, yPosition: number) => void;
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

// Decorative Surah Banner Component using surah_title.gif
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
        سورة  {name}
      </Text>
    </View>
  );
};

const surahBannerStyles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    height: 44,
  },
  image: {
    width: width - 16,
    height: 44,
    position: 'absolute',
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 50,
    width: width - 16,
    lineHeight: 28,
  },
});

const QuranPage: React.FC<QuranPageProps> = ({
  page,
  selectedAyah,
  setSelectedAyah,
  onWordSelect,
  onTap,
}) => {
  const [quranWords, setQuranWords] = useState<QuranWords | undefined>();
  const [isLoading, setLoading] = useState(true);
  const [arabicFontLoaded, setArabicFontLoaded] = useState(false);
  const { colors } = useSelector((state: RootState) => state.config);
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

  // Compute word indices within each ayah for all words on the page
  const wordIndicesInAyah = useMemo(() => {
    const indices = new Map<string, number>();
    const ayahWordCounts = new Map<string, number>();

    quranWords?.ayahs?.forEach((line, lineIndex) => {
      if (line.words) {
        line.words.forEach((word, wordIndex) => {
          const currentCount = ayahWordCounts.get(word.ayahKey) || 0;
          indices.set(`${lineIndex}-${wordIndex}`, currentCount);
          ayahWordCounts.set(word.ayahKey, currentCount + 1);
        });
      }
    });

    return indices;
  }, [quranWords]);

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
            const arabicName = getArabicSurahName(surahName);
            return (
              <View key={`line-${lineIndex}`}>
                <SurahBanner name={arabicName} textColor={colors.textPrimary} fontLoaded={arabicFontLoaded} />
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
                    const wordIndexInAyah = wordIndicesInAyah.get(`${lineIndex}-${wordIndex}`);
                    const wordHasMistake = wordsWithMistakes.get(word.ayahKey)?.has(wordIndexInAyah ?? -1) ?? false;
                    return (
                      <Text
                        key={`word-${lineIndex}-${wordIndex}`}
                        onPress={onTap}
                        onLongPress={(e) => {
                          const yPosition = e.nativeEvent.pageY;
                          if (isWordSelected) {
                            setSelectedAyah(null);
                          } else {
                            setSelectedAyah(word.ayahKey);
                            onWordSelect?.(word.ayahKey, yPosition);
                          }
                        }}
                        style={[
                          isWordSelected && { color: colors.accent },
                          wordHasMistake && !isWordSelected && { color: colors.danger },
                        ]}
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
    justifyContent: 'flex-start',
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
