import quranWordsNpm from '@kmaslesa/holy-quran-word-by-word-min';
import { loadAsync } from 'expo-font';
import React, { memo, useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  Image,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { useSelector } from 'react-redux';

import { quranFonts } from '../data/quranFonts';
import { RootState } from '../store';

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

interface Ayah {
  metaData?: {
    lineType?: string;
    suraName?: string;
  };
  words?: Word[];
}

interface QuranWords {
  ayahs?: Ayah[];
}

const QuranPage: React.FC<QuranPageProps> = ({
  page,
  selectedAyah,
  setSelectedAyah,
}) => {
  const [quranWords, setQuranWords] = useState<QuranWords | undefined>();
  const [isLoading, setLoading] = useState(true);
  const { colors } = useSelector((state: RootState) => state.config);

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

  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.bgPrimary }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.pressableContainer, { backgroundColor: colors.bgPrimary }]}>
      {quranWords?.ayahs?.map((ayah, ayahIndex) => (
        <View style={styles.ayaLine} key={`ayah:${ayahIndex}`}>
          {ayah.metaData?.lineType === 'start_sura' && (
            <View style={styles.surahTitleWrapper}>
              <View style={[styles.surahTitleBox, { borderColor: colors.accent }]}>
                <Text style={[styles.surahTitleText, { color: colors.textPrimary }]}>
                  {ayah.metaData?.suraName}
                </Text>
              </View>
            </View>
          )}

          {ayah.metaData?.lineType === 'besmellah' && (
            <View>
              <Text style={[styles.bismillah, { color: colors.textPrimary }]}>
                ﷽
              </Text>
            </View>
          )}

          {ayah.words?.length !== 0 &&
            ayah.words?.map((word, wordIndex) => {
              return (
                <Text
                  style={{
                    fontSize: moderateScale(22, 0.2),
                    fontFamily: quranFonts[`p${page}`] ? `p${page}` : undefined,
                    color:
                      selectedAyah === word?.ayahKey
                        ? colors.accent
                        : colors.textPrimary,
                  }}
                  key={`${word?.codeV1}-${wordIndex}`}
                  onPress={() => {
                    if (selectedAyah === word?.ayahKey) {
                      setSelectedAyah(null);
                    } else {
                      setSelectedAyah(word?.ayahKey);
                    }
                  }}
                >
                  {word?.codeV1}
                </Text>
              );
            })}
        </View>
      ))}
      <Text style={[styles.pageInfo, { color: colors.textSecondary }]}>
        {page}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  ayaLine: {
    position: 'relative',
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  pageInfo: {
    fontSize: moderateScale(12, 0.2),
    marginTop: 10,
  },
  bismillah: {
    fontWeight: '400',
    fontSize: moderateScale(40, 0.2),
  },
  surahTitleWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
    width,
    marginBottom: 10,
  },
  surahTitleBox: {
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 40,
    paddingVertical: 8,
  },
  surahTitleText: {
    fontSize: moderateScale(16, 0.2),
    fontWeight: '600',
  },
  loading: {
    height,
    width,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressableContainer: {
    width,
    minHeight: height,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 0 : 40,
    paddingHorizontal: 10,
  },
});

export default memo(QuranPage);
