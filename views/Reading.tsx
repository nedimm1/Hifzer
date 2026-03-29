import quranMetaData from '@kmaslesa/quran-metadata';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { loadAsync } from 'expo-font';
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  FlatList,
} from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { useMutation } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { spacing } from '../constants/spacing';
import chapters from '../data/chapters.json';
import { quranFonts } from '../data/quranFonts';
import { getAyahTranslation, translationLanguages } from '../services/reading';
import { RootState } from '../store';
import { selectMistakes } from '../store/mistakesSlice';
import MistakeModal from '../components/MistakeModal';
import { Mistake } from '../types/mistakes';

interface AyahReference {
  ayah: number;
  surah: number;
}

interface ReadingProps {
  selectedAyah: string;
  closeDialog?: () => void;
}

const { width } = Dimensions.get('window');

const Reading: React.FC<ReadingProps> = ({ selectedAyah }) => {
  const { t } = useTranslation();
  const { colors, translationLanguage } = useSelector(
    (state: RootState) => state.config
  );
  const allMistakes = useSelector(selectMistakes);

  const [arabicText, setArabicText] = useState('');
  const [translation, setTranslation] = useState('');
  const [surahName, setSurahName] = useState('');
  const [ayahReference, setAyahReference] = useState<AyahReference>({
    ayah: Number(selectedAyah.split(':')[1]),
    surah: Number(selectedAyah.split(':')[0]),
  });
  const [isFocused, setIsFocused] = useState(true);
  const [suraEndAyahNumber, setSuraEndAyahNumber] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [arabicFontLoaded, setArabicFontLoaded] = useState(false);

  // Load Arabic font
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

  // Mistake tracking state
  const [selectedWord, setSelectedWord] = useState<{ word: string; index: number } | null>(null);
  const [showMistakeModal, setShowMistakeModal] = useState(false);
  const [editingMistake, setEditingMistake] = useState<Mistake | null>(null);

  const pagerRef = useRef<FlatList>(null);

  // Get mistakes for current ayah
  const ayahMistakes = useMemo(() => {
    return allMistakes.filter(
      (m) => m.surahNumber === ayahReference.surah && m.ayahNumber === ayahReference.ayah
    );
  }, [allMistakes, ayahReference.surah, ayahReference.ayah]);

  // Get word indices that have mistakes
  const mistakeWordIndices = useMemo(() => {
    return ayahMistakes.map((m) => m.wordIndex);
  }, [ayahMistakes]);

  // Split Arabic text into words
  const arabicWords = useMemo(() => {
    return arabicText.split(' ').filter((word) => word.trim() !== '');
  }, [arabicText]);

  const handleWordTap = (word: string, index: number) => {
    setSelectedWord({ word, index });
    setEditingMistake(null);
    setShowMistakeModal(true);
  };

  const handleEditMistake = (mistake: Mistake) => {
    setSelectedWord({ word: mistake.wordText, index: mistake.wordIndex });
    setEditingMistake(mistake);
    setShowMistakeModal(true);
  };

  const handleCloseMistakeModal = () => {
    setShowMistakeModal(false);
    setSelectedWord(null);
    setEditingMistake(null);
  };

  const quranTranslation = useMemo(() => {
    return translationLanguages[translationLanguage]?.code || 'bosnian_korkut';
  }, [translationLanguage]);

  const { mutateAsync: translateAyah, isPending: isLoadingTranslation } =
    useMutation({
      mutationFn: (data: { surah: number; ayah: number }) =>
        getAyahTranslation({ ...data, translation: quranTranslation }),
    });

  const fetchAyah = useCallback(async () => {
    const numOfChapter = ayahReference.surah;
    const numOfVerse = ayahReference.ayah;

    try {
      const response = await translateAyah({
        surah: numOfChapter,
        ayah: numOfVerse,
      });

      if (response.result) {
        const {
          arabic_text: fetchedArabicText,
          translation: ayahTranslation,
          sura: surah,
        } = response.result;

        setArabicText(fetchedArabicText);
        setTranslation(ayahTranslation);

        const suraData = quranMetaData.getSuraByIndex(surah);
        setSuraEndAyahNumber(suraData.numberOfAyas);

        const chapter = (chapters as any[]).find((c) => c.index.includes(surah));
        const selectedSurahName = chapter?.titleAr ? `سورة  ${chapter.titleAr}` : '';
        setSurahName(selectedSurahName);
      }
    } catch (error) {
      console.log('Error fetching ayah data:', error);
    }
  }, [ayahReference, translateAyah]);

  useEffect(() => {
    fetchAyah();
  }, [ayahReference.surah, ayahReference.ayah]);

  const getNextAyah = () => {
    setAyahReference((prev) => ({ ...prev, ayah: prev.ayah + 1 }));
  };

  const getPreviousAyah = () => {
    setAyahReference((prev) => ({ ...prev, ayah: prev.ayah - 1 }));
  };

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => {
        setIsFocused(false);
      };
    }, [])
  );

  const handleTabChange = (index: number) => {
    setActiveTab(index);
    pagerRef.current?.scrollToIndex({ index, animated: true });
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveTab(viewableItems[0].index);
    }
  }).current;

  if (!isFocused) {
    return <View />;
  }

  if (isLoadingTranslation) {
    return (
      <View
        style={[styles.center, { backgroundColor: colors.bgPrimary, flex: 1 }]}
      >
        <ActivityIndicator color={colors.accent} size={moderateScale(50, 0.2)} />
      </View>
    );
  }

  const renderArabicContent = () => (
    <View style={[styles.contentCard, { backgroundColor: colors.bgSecondary, width: width - 40 }]}>
      {ayahMistakes.length === 0 && (
        <Text style={[styles.tapHint, { color: colors.textSecondary }]}>
          {t('reading.tapToMark')}
        </Text>
      )}
      <View style={styles.wordsContainer}>
        {arabicWords.map((word, index) => {
          const hasMistake = mistakeWordIndices.includes(index);

          return (
            <TouchableOpacity
              key={`word-${index}`}
              onPress={() => handleWordTap(word, index)}
              activeOpacity={0.6}
              style={styles.wordTouchable}
            >
              <Text
                style={{
                  color: hasMistake ? colors.danger : colors.textPrimary,
                  fontSize: moderateScale(32, 0.2),
                  lineHeight: moderateScale(56, 0.2),
                  fontFamily: arabicFontLoaded ? 'Arabic' : undefined,
                }}
              >
                {word}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderTranslationContent = () => (
    <View style={[styles.contentCard, { backgroundColor: colors.bgSecondary, width: width - 40 }]}>
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: moderateScale(12, 0.2),
          fontWeight: '600',
          marginBottom: spacing.sm,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}
      >
        {t('reading.translation')}
      </Text>
      <Text
        style={{
          color: colors.textPrimary,
          fontSize: moderateScale(18, 0.2),
          lineHeight: moderateScale(30, 0.2),
        }}
      >
        {translation}
      </Text>
    </View>
  );

  const pages = [
    { key: 'arabic', render: renderArabicContent },
    { key: 'translation', render: renderTranslationContent },
  ];

  return (
    <View
      style={{
        width,
        backgroundColor: colors.bgPrimary,
        flexDirection: 'column',
        flex: 1,
      }}
    >
      {/* Header */}
      <View
        style={{
          paddingTop: moderateScale(60, 0.2),
          paddingHorizontal: moderateScale(20, 0.2),
          paddingBottom: moderateScale(8, 0.2),
        }}
      >
        <Text
          style={{
            color: colors.accent,
            fontWeight: '700',
            fontSize: moderateScale(20, 0.2),
            letterSpacing: 0.5,
          }}
        >
          {surahName}
        </Text>
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: moderateScale(14, 0.2),
            marginTop: 4,
          }}
        >
          {t('reading.ayah')} {ayahReference.ayah} {t('reading.of')} {suraEndAyahNumber}
        </Text>
      </View>

      {/* Tab Indicator */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 0 && { backgroundColor: colors.accent },
          ]}
          onPress={() => handleTabChange(0)}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 0 ? '#FFFFFF' : colors.textSecondary },
            ]}
          >
            {t('reading.arabic')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 1 && { backgroundColor: colors.accent },
          ]}
          onPress={() => handleTabChange(1)}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 1 ? '#FFFFFF' : colors.textSecondary },
            ]}
          >
            {t('reading.translation')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={{
          paddingBottom: moderateScale(120, 0.2),
        }}
        style={{ flex: 1 }}
      >
        {/* Swipeable Arabic/Translation */}
        <FlatList
          ref={pagerRef}
          data={pages}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <View style={styles.pageContainer}>
              {item.render()}
            </View>
          )}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
          getItemLayout={(_, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
        />

        {/* Mistakes for this Ayah */}
        {ayahMistakes.length > 0 && (
          <View style={styles.mistakesSection}>
            <Text style={[styles.mistakesSectionTitle, { color: colors.textSecondary }]}>
              {t('reading.mistakesCount')} ({ayahMistakes.length})
            </Text>
            {ayahMistakes.map((mistake) => (
              <TouchableOpacity
                key={mistake.id}
                style={[styles.mistakeItem, { backgroundColor: colors.bgSecondary, borderLeftColor: colors.danger }]}
                onPress={() => handleEditMistake(mistake)}
                activeOpacity={0.7}
              >
                <View style={styles.mistakeItemContent}>
                  <Text style={[styles.mistakeWord, { color: colors.danger, fontFamily: arabicFontLoaded ? 'Arabic' : undefined }]}>
                    {mistake.wordText}
                  </Text>
                  {mistake.note ? (
                    <Text style={[styles.mistakeNote, { color: colors.textPrimary }]}>
                      {mistake.note}
                    </Text>
                  ) : (
                    <Text style={[styles.mistakeNoNote, { color: colors.textSecondary }]}>
                      {t('reading.addNote')}
                    </Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View
        style={{
          backgroundColor: colors.bgPrimary,
          paddingHorizontal: moderateScale(16, 0.2),
          paddingTop: moderateScale(12, 0.2),
          paddingBottom: moderateScale(48, 0.2),
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <View
          style={{
            backgroundColor: colors.bgSecondary,
            borderRadius: moderateScale(16, 0.2),
            paddingHorizontal: moderateScale(16, 0.2),
            paddingVertical: moderateScale(12, 0.2),
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Previous Button */}
          <TouchableOpacity
            activeOpacity={ayahReference.ayah <= 1 ? 0.4 : 0.7}
            onPress={getPreviousAyah}
            disabled={ayahReference.ayah <= 1}
            style={{
              padding: moderateScale(10, 0.2),
              borderRadius: moderateScale(10, 0.2),
              backgroundColor:
                ayahReference.ayah > 1 ? `${colors.accent}15` : `${colors.textSecondary}10`,
            }}
          >
            <Ionicons
              name="chevron-back"
              size={moderateScale(24, 0.2)}
              color={ayahReference.ayah > 1 ? colors.accent : colors.textSecondary}
            />
          </TouchableOpacity>

          {/* Ayah Counter */}
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: moderateScale(16, 0.2),
              fontWeight: '600',
            }}
          >
            {ayahReference.ayah} / {suraEndAyahNumber}
          </Text>

          {/* Next Button */}
          <TouchableOpacity
            activeOpacity={ayahReference.ayah >= suraEndAyahNumber ? 0.4 : 0.7}
            onPress={getNextAyah}
            disabled={ayahReference.ayah >= suraEndAyahNumber}
            style={{
              padding: moderateScale(10, 0.2),
              borderRadius: moderateScale(10, 0.2),
              backgroundColor:
                ayahReference.ayah < suraEndAyahNumber
                  ? `${colors.accent}15`
                  : `${colors.textSecondary}10`,
            }}
          >
            <Ionicons
              name="chevron-forward"
              size={moderateScale(24, 0.2)}
              color={
                ayahReference.ayah < suraEndAyahNumber ? colors.accent : colors.textSecondary
              }
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Mistake Modal */}
      {selectedWord && (
        <MistakeModal
          visible={showMistakeModal}
          word={selectedWord.word}
          wordIndex={selectedWord.index}
          surahNumber={ayahReference.surah}
          surahName={surahName}
          ayahNumber={ayahReference.ayah}
          onClose={handleCloseMistakeModal}
          existingMistake={editingMistake}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    flexGrow: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  pageContainer: {
    width,
    paddingHorizontal: 20,
  },
  contentCard: {
    borderRadius: 16,
    padding: 24,
  },
  wordsContainer: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  wordTouchable: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  tapHint: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 12,
  },
  mistakesSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  mistakesSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  mistakeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  mistakeItemContent: {
    flex: 1,
  },
  mistakeWord: {
    fontSize: 28,
  },
  mistakeNote: {
    fontSize: 14,
    marginTop: 6,
  },
  mistakeNoNote: {
    fontSize: 14,
    marginTop: 6,
    fontStyle: 'italic',
  },
});

export default Reading;
