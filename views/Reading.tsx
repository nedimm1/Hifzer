import quranMetaData from '@kmaslesa/quran-metadata';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { useMutation } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

import { spacing } from '../constants/spacing';
import chapters from '../data/chapters.json';
import { getAyahTranslation, translationLanguages } from '../services/reading';
import { RootState } from '../store';

interface AyahReference {
  ayah: number;
  surah: number;
}

interface ReadingProps {
  selectedAyah: string;
  closeDialog?: () => void;
}

const Reading: React.FC<ReadingProps> = ({ selectedAyah }) => {
  const { colors, translationLanguage } = useSelector(
    (state: RootState) => state.config
  );
  const [arabicText, setArabicText] = useState('');
  const [translation, setTranslation] = useState('');
  const [surahName, setSurahName] = useState('');
  const [ayahReference, setAyahReference] = useState<AyahReference>({
    ayah: Number(selectedAyah.split(':')[1]),
    surah: Number(selectedAyah.split(':')[0]),
  });
  const [isFocused, setIsFocused] = useState(true);
  const [suraEndAyahNumber, setSuraEndAyahNumber] = useState(0);

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

        const { numberOfAyas } = quranMetaData.getSuraByIndex(surah);
        setSuraEndAyahNumber(numberOfAyas);

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
  }, [fetchAyah]);

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

  const { width } = Dimensions.get('window');

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
          paddingBottom: moderateScale(16, 0.2),
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
          Ayah {ayahReference.ayah} of {suraEndAyahNumber}
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: moderateScale(20, 0.2),
          paddingBottom: moderateScale(120, 0.2),
        }}
        style={{ flex: 1 }}
      >
        {/* Arabic Text Card */}
        <View
          style={{
            backgroundColor: colors.bgSecondary,
            borderRadius: moderateScale(16, 0.2),
            padding: moderateScale(24, 0.2),
            marginBottom: moderateScale(16, 0.2),
          }}
        >
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: moderateScale(32, 0.2),
              lineHeight: moderateScale(56, 0.2),
              textAlign: 'right',
              fontFamily: 'Arabic',
            }}
          >
            {arabicText}
          </Text>
        </View>

        {/* Translation Card */}
        <View
          style={{
            backgroundColor: colors.bgSecondary,
            borderRadius: moderateScale(16, 0.2),
            padding: moderateScale(20, 0.2),
          }}
        >
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
            Translation
          </Text>
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: moderateScale(16, 0.2),
              lineHeight: moderateScale(26, 0.2),
            }}
          >
            {translation}
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View
        style={{
          backgroundColor: colors.bgPrimary,
          paddingHorizontal: moderateScale(24, 0.2),
          paddingTop: moderateScale(16, 0.2),
          paddingBottom: moderateScale(40, 0.2),
          borderTopWidth: 1,
          borderTopColor: colors.border,
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
              padding: moderateScale(8, 0.2),
            }}
          >
            <Ionicons
              name="chevron-back"
              size={moderateScale(28, 0.2)}
              color={
                ayahReference.ayah > 1 ? colors.accent : colors.textSecondary
              }
            />
          </TouchableOpacity>

          {/* Ayah indicator */}
          <View
            style={{
              backgroundColor: colors.accent,
              paddingVertical: moderateScale(8, 0.2),
              paddingHorizontal: moderateScale(16, 0.2),
              borderRadius: moderateScale(20, 0.2),
            }}
          >
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: moderateScale(14, 0.2),
                fontWeight: '700',
              }}
            >
              {ayahReference.ayah} / {suraEndAyahNumber}
            </Text>
          </View>

          {/* Next Button */}
          <TouchableOpacity
            activeOpacity={ayahReference.ayah >= suraEndAyahNumber ? 0.4 : 0.7}
            onPress={getNextAyah}
            disabled={ayahReference.ayah >= suraEndAyahNumber}
            style={{
              padding: moderateScale(8, 0.2),
            }}
          >
            <Ionicons
              name="chevron-forward"
              size={moderateScale(28, 0.2)}
              color={
                ayahReference.ayah < suraEndAyahNumber
                  ? colors.accent
                  : colors.textSecondary
              }
            />
          </TouchableOpacity>
      </View>
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
});

export default Reading;
