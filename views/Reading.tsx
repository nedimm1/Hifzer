import quranMetaData from '@kmaslesa/quran-metadata';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Audio disabled - requires development build
// import { Audio, AVPlaybackStatus } from 'expo-av';
import { useFocusEffect } from 'expo-router';
import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { moderateScale } from 'react-native-size-matters';
import { useMutation } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

import { PlayReadingButton } from '../components/PlayReadingButton';
import { spacing } from '../constants/spacing';
import chapters from '../data/chapters.json';
import { getAyahTranslation, getSegments, translationLanguages } from '../services/reading';
import { RootState } from '../store';

interface Reciter {
  label: string;
  value: string;
  reciterId: string;
}

interface WordTiming {
  text: string;
  start: number;
  end: number;
}

interface AyahReference {
  ayah: number;
  surah: number;
}

const reciters: Reciter[] = [
  {
    label: 'Al Husary',
    value: 'https://www.everyayah.com/data/Husary_128kbps/{{audioName}}.mp3',
    reciterId: '6',
  },
  {
    label: 'Al Minshawy - Murattal',
    value: 'https://www.everyayah.com/data/Minshawy_Murattal_128kbps/{{audioName}}.mp3',
    reciterId: '9',
  },
  {
    label: 'Al Afasy',
    value: 'https://www.everyayah.com/data/Alafasy_128kbps/{{audioName}}.mp3',
    reciterId: '7',
  },
  {
    label: 'Khalifa Al Tunaiji',
    value: 'https://everyayah.com/data/khalefa_al_tunaiji_64kbps/{{audioName}}.mp3',
    reciterId: '161',
  },
];

interface ReadingProps {
  selectedAyah: string;
  closeDialog?: () => void;
}

const Reading: React.FC<ReadingProps> = ({ selectedAyah, closeDialog }) => {
  const [open, setOpen] = useState(false);
  const { i18n } = useTranslation();
  const { colors, translationLanguage } = useSelector((state: RootState) => state.config);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioName, setAudioName] = useState('');
  const [text, setText] = useState<WordTiming[]>([]);
  const [translation, setTranslation] = useState('');
  const [surahName, setSurahName] = useState('');
  const [ayahReference, setAyahReference] = useState<AyahReference>({
    ayah: Number(selectedAyah.split(':')[1]),
    surah: Number(selectedAyah.split(':')[0]),
  });
  const [audioPosition, setAudioPosition] = useState(0);
  const [isFocused, setIsFocused] = useState(true);
  const [reciter, setReciter] = useState<Reciter>(reciters[0]);
  const [suraEndAyahNumber, setSuraEndAyahNumber] = useState(0);

  const translateAyahResponseHandler = useCallback((data: any, timings: any) => {
    if (data.result) {
      const {
        arabic_text: arabicText,
        translation: ayahTranslation,
        sura: surah,
      } = data.result;

      setTranslation(ayahTranslation);
      const arabicTextWords = arabicText.split(' ').map((t: string, i: number) => ({
        text: t,
        start: timings.segments[i][0],
        end: timings.segments[i][1],
      }));
      setText(arabicTextWords);

      const { numberOfAyas } = quranMetaData.getSuraByIndex(surah);
      setSuraEndAyahNumber(numberOfAyas);

      const selectedSurahName =
        (chapters as any[]).find((c) => c.index.includes(surah))?.title || '';
      setSurahName(selectedSurahName);
    }
  }, []);

  const getTimings = useCallback((data: any) => {
    const firstSegmentLength = data.segments[0][1];
    const segments = data.segments.map((s: number[]) => [
      s[1] - firstSegmentLength,
      s[2] - firstSegmentLength,
    ]);
    const timingsData = { ...data, segments };
    return timingsData;
  }, []);

  const quranTranslation = useMemo(() => {
    return translationLanguages[translationLanguage]?.code || 'bosnian_korkut';
  }, [translationLanguage]);

  const { mutateAsync: translateAyah, isPending: isLoadingTranslation } =
    useMutation({
      mutationFn: (data: { surah: number; ayah: number }) =>
        getAyahTranslation({ ...data, translation: quranTranslation }),
    });

  const { mutateAsync: getSurahSegments } = useMutation({
    mutationFn: (data: { surah: number; ayah: number; reciterId: string }) =>
      getSegments(data.surah, data.ayah, data.reciterId),
  });

  const pickAyah = useCallback(async () => {
    setAudioPosition(0);
    setIsPlaying(false);

    const numOfChapter =
      (ayahReference && Number(ayahReference.surah)) ||
      Math.floor(Math.random() * 114 + 1);

    const numOfVerse =
      (ayahReference && Number(ayahReference.ayah)) ||
      Math.floor(Math.random() * (chapters as any[])[numOfChapter - 1].count + 1);

    const getNumForAudio = (num: number) => {
      let numString = '';
      if (num < 10) {
        numString = '00' + num;
      } else if (num < 100) {
        numString = '0' + num;
      } else {
        numString = num.toString();
      }
      return numString;
    };

    const newAudioName = `${getNumForAudio(numOfChapter)}${getNumForAudio(numOfVerse)}`;
    setAudioName(newAudioName);

    try {
      const data = await getSurahSegments({
        surah: numOfChapter,
        ayah: numOfVerse,
        reciterId: reciter.reciterId,
      });
      const translateAyahResponse = await translateAyah({
        surah: numOfChapter,
        ayah: numOfVerse,
      });

      translateAyahResponseHandler(translateAyahResponse, getTimings(data));
    } catch (error) {
      console.log('Error fetching ayah data:', error);
    }
  }, [
    ayahReference,
    reciter,
    getSurahSegments,
    translateAyah,
    getTimings,
    translateAyahResponseHandler,
  ]);

  // Audio disabled - requires development build
  const playSound = useCallback(() => {
    console.log('Audio playback requires a development build');
    // Show a brief loading state to give user feedback
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, []);

  const stopSound = useCallback(() => {
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    pickAyah();
  }, [reciter, ayahReference]);

  useEffect(() => {
    AsyncStorage.getItem('reciter').then((value) => {
      const selectedReciter = reciters.find((x) => x.reciterId === value);
      if (value && selectedReciter) {
        setReciter(selectedReciter);
      }
    });
  }, []);

  const getNextAyah = () => {
    setAyahReference((prev) => ({ ...prev, ayah: prev.ayah + 1 }));
  };

  const getPreviousAyah = () => {
    setAyahReference((prev) => ({ ...prev, ayah: prev.ayah - 1 }));
  };

  const onChangeReciterHandler = (callback: any) => {
    const value = typeof callback === 'function' ? callback() : callback;
    const selectedReciter = reciters.find((x) => x.value === value);
    if (selectedReciter) {
      setIsPlaying(false);
      setReciter(selectedReciter);
      AsyncStorage.setItem('reciter', selectedReciter.reciterId);
    }
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
      <View style={[styles.center, { backgroundColor: colors.bgPrimary, flex: 1 }]}>
        <ActivityIndicator color={colors.accent} size={moderateScale(50, 0.2)} />
      </View>
    );
  }

  const { width, height } = Dimensions.get('window');

  return (
    <View
      style={{
        width,
        backgroundColor: colors.bgPrimary,
        flexDirection: 'column',
        flex: 1,
      }}
    >
      {/* Reciter Dropdown at Top */}
      <View
        style={{
          position: 'absolute',
          top: moderateScale(18, 0.2),
          left: 0,
          right: 0,
          marginHorizontal: moderateScale(20, 0.2),
          zIndex: 9999,
          elevation: 20,
          height: moderateScale(90, 0.2),
        }}
      >
        <View
          style={{
            backgroundColor: colors.bgSecondary,
            borderRadius: moderateScale(16, 0.2),
            paddingHorizontal: moderateScale(16, 0.2),
            paddingVertical: moderateScale(12, 0.2),
            elevation: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
          }}
        >
          <Text
            style={{
              color: colors.textPrimary,
              fontWeight: '700',
              fontSize: moderateScale(12, 0.2),
              marginBottom: 8,
              opacity: 0.7,
              letterSpacing: 0.3,
            }}
          >
            RECITER
          </Text>
          <DropDownPicker
            open={open}
            value={reciter.value}
            items={reciters}
            setOpen={setOpen}
            setValue={onChangeReciterHandler}
            zIndex={9999}
            zIndexInverse={9999}
            style={{
              borderRadius: moderateScale(12, 0.2),
              borderWidth: 1,
              borderColor: `${colors.accent}30`,
              backgroundColor: colors.bgPrimary,
              paddingHorizontal: moderateScale(12, 0.2),
              minHeight: moderateScale(44, 0.2),
            }}
            textStyle={{
              color: colors.textPrimary,
              fontSize: moderateScale(15, 0.2),
              fontWeight: '600',
            }}
            containerStyle={{
              minHeight: moderateScale(44, 0.2),
            }}
            listItemContainerStyle={{
              backgroundColor: colors.bgPrimary,
              paddingHorizontal: moderateScale(12, 0.2),
              paddingVertical: moderateScale(12, 0.2),
              borderBottomWidth: 1,
              borderBottomColor: `${colors.textPrimary}10`,
            }}
            dropDownContainerStyle={{
              backgroundColor: colors.bgSecondary,
              borderColor: `${colors.accent}30`,
              borderRadius: moderateScale(12, 0.2),
            }}
            ArrowUpIconComponent={() => (
              <Ionicons
                name="chevron-up"
                color={colors.accent}
                size={moderateScale(24, 0.2)}
              />
            )}
            ArrowDownIconComponent={() => (
              <Ionicons
                name="chevron-down"
                color={colors.accent}
                size={moderateScale(24, 0.2)}
              />
            )}
            TickIconComponent={() => (
              <Ionicons
                name="checkmark-circle"
                color={colors.accent}
                size={moderateScale(20, 0.2)}
              />
            )}
          />
        </View>
      </View>

      {/* ScrollView with Arabic Text Card */}
      <ScrollView
        scrollEnabled
        contentContainerStyle={{
          paddingBottom: moderateScale(140, 0.2),
          marginBottom: moderateScale(100, 0.2),
        }}
        nestedScrollEnabled={false}
        style={{
          marginTop: moderateScale(120, 0.2),
          flex: 1,
        }}
      >
        {/* Arabic Text Card */}
        <View
          style={{
            marginHorizontal: moderateScale(20, 0.2),
            marginBottom: moderateScale(24, 0.2),
          }}
        >
          <View
            style={{
              backgroundColor: colors.bgSecondary,
              borderRadius: moderateScale(16, 0.2),
              paddingVertical: moderateScale(28, 0.2),
              paddingHorizontal: moderateScale(20, 0.2),
              elevation: 3,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              borderWidth: isPlaying ? 2 : 1,
              borderColor: isPlaying ? colors.accent : `${colors.accent}33`,
            }}
          >
            <View style={{ paddingBottom: spacing.lg }}>
              <Text
                style={{
                  color: colors.accent,
                  fontWeight: '700',
                  fontSize: moderateScale(14, 0.2),
                  letterSpacing: 0.5,
                  marginBottom: 4,
                }}
              >
                {surahName}
              </Text>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: moderateScale(12, 0.2),
                  opacity: 0.7,
                }}
              >
                Ayah {ayahReference?.ayah} of {suraEndAyahNumber}
              </Text>
            </View>
            <Text
              style={[
                styles.arabicText,
                {
                  color: colors.textPrimary,
                  fontSize: moderateScale(44, 0.2),
                  lineHeight: moderateScale(80, 0.2),
                  textAlign: 'right',
                  marginBottom: moderateScale(16, 0.2),
                },
              ]}
            >
              {text.map((t, i) => {
                const isWordActive =
                  audioPosition &&
                  audioPosition >= 0 &&
                  t.start <= audioPosition &&
                  audioPosition < t.end;
                return (
                  <Text
                    style={{
                      color: isWordActive ? colors.accent : colors.textPrimary,
                      fontFamily: 'Arabic',
                      fontSize: moderateScale(44, 0.2),
                      backgroundColor: isWordActive
                        ? `${colors.accent}15`
                        : 'transparent',
                      borderRadius: 4,
                      paddingHorizontal: 2,
                    }}
                    key={`${t.start}-${i}`}
                  >
                    {t.text}{' '}
                  </Text>
                );
              })}
            </Text>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: moderateScale(15, 0.2),
                lineHeight: moderateScale(24, 0.2),
                opacity: 0.8,
                textAlign: 'left',
                marginBottom: moderateScale(20, 0.2),
              }}
            >
              {translation}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Controls */}
      <View
        style={{
          position: 'absolute',
          bottom: 20,
          left: 0,
          right: 0,
          backgroundColor: colors.bgPrimary,
          paddingHorizontal: moderateScale(16, 0.2),
          paddingVertical: moderateScale(12, 0.2),
          paddingBottom: moderateScale(16, 0.2),
          elevation: 25,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          borderTopWidth: 1,
          borderTopColor: `${colors.textPrimary}10`,
          zIndex: 1000,
        }}
      >
        <View
          style={{
            backgroundColor: colors.bgSecondary,
            borderRadius: moderateScale(16, 0.2),
            paddingHorizontal: moderateScale(16, 0.2),
            paddingVertical: moderateScale(14, 0.2),
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
          }}
        >
          {/* Previous Button */}
          <TouchableOpacity
            activeOpacity={ayahReference?.ayah <= 1 ? 1 : 0.6}
            onPress={() => {
              if (ayahReference?.ayah > 1) {
                getPreviousAyah();
              }
            }}
            disabled={ayahReference?.ayah <= 1}
            style={{
              paddingVertical: moderateScale(10, 0.2),
              paddingHorizontal: moderateScale(12, 0.2),
              borderRadius: moderateScale(10, 0.2),
              backgroundColor:
                ayahReference?.ayah > 1
                  ? `${colors.accent}15`
                  : `${colors.textPrimary}10`,
            }}
          >
            <Ionicons
              name="chevron-back"
              size={moderateScale(24, 0.2)}
              color={
                ayahReference?.ayah > 1
                  ? colors.accent
                  : colors.textSecondary
              }
            />
          </TouchableOpacity>

          {/* Play Button - Center */}
          <PlayReadingButton
            isLoading={isLoading}
            isPlaying={isPlaying}
            playSound={playSound}
            stopSound={stopSound}
          />

          {/* Next Button */}
          <TouchableOpacity
            activeOpacity={
              ayahReference?.ayah >= suraEndAyahNumber ? 1 : 0.6
            }
            onPress={() => {
              if (ayahReference?.ayah < suraEndAyahNumber) {
                getNextAyah();
              }
            }}
            disabled={ayahReference?.ayah >= suraEndAyahNumber}
            style={{
              paddingVertical: moderateScale(10, 0.2),
              paddingHorizontal: moderateScale(12, 0.2),
              borderRadius: moderateScale(10, 0.2),
              backgroundColor:
                ayahReference?.ayah < suraEndAyahNumber
                  ? `${colors.accent}15`
                  : `${colors.textPrimary}10`,
            }}
          >
            <Ionicons
              name="chevron-forward"
              size={moderateScale(24, 0.2)}
              color={
                ayahReference?.ayah < suraEndAyahNumber
                  ? colors.accent
                  : colors.textSecondary
              }
            />
          </TouchableOpacity>
        </View>
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
  arabicText: {
    fontSize: moderateScale(44, 0.2),
    textAlign: 'right',
    fontFamily: 'Arabic',
    lineHeight: moderateScale(56, 0.2),
  },
});

export default Reading;
