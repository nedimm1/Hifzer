import { useRouter } from 'expo-router';
import React, { useCallback, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import quranMetaData from '@kmaslesa/quran-metadata';

import QuranPage from './QuranPage';
import { RootState } from '../store';
import { selectMistakes } from '../store/mistakesSlice';
import { spacing } from '../constants/spacing';
import { getSurahTransliteration } from '../utils/surahName';

const { width } = Dimensions.get('window');

interface QuranPagesProps {
  route: {
    params: {
      page?: number;
    };
  };
  selectedAyah: string | null;
  setSelectedAyah: (ayah: string | null) => void;
  onTap?: () => void;
  onPageChange?: (page: number) => void;
}

// Helper to get surah name from ayah key
const getSurahName = (ayahKey: string): string => {
  const surahNumber = parseInt(ayahKey.split(':')[0], 10);
  const sura = quranMetaData.getSuraByIndex(surahNumber);
  if (!sura) return `Surah ${surahNumber}`;
  return getSurahTransliteration(sura.name);
};

const QuranPages: React.FC<QuranPagesProps> = ({ route, selectedAyah, setSelectedAyah, onTap, onPageChange }) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useSelector((state: RootState) => state.config);
  const allMistakes = useSelector(selectMistakes);
  const [tooltipY, setTooltipY] = useState<number>(0);
  const [pointerBelow, setPointerBelow] = useState<boolean>(true);
  const { height } = Dimensions.get('window');

  const initialScrollIndex = route.params.page ? route.params.page - 1 : 0;

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: Array<{ item: number }> }) => {
      if (viewableItems.length > 0 && onPageChange) {
        onPageChange(viewableItems[0].item);
      }
    },
    [onPageChange]
  );

  const viewabilityConfig = useMemo(
    () => ({
      itemVisiblePercentThreshold: 50,
    }),
    []
  );

  // Get mistake count for selected ayah
  const mistakeCount = useMemo(() => {
    if (!selectedAyah) return 0;
    const [surah, ayah] = selectedAyah.split(':').map(Number);
    return allMistakes.filter(m => m.surahNumber === surah && m.ayahNumber === ayah).length;
  }, [selectedAyah, allMistakes]);

  const handleWordSelect = useCallback((ayahKey: string, yPosition: number) => {
    const tooltipHeight = 80;
    const padding = 100;

    // Check if tooltip should appear above or below
    if (yPosition + tooltipHeight + padding > height) {
      // Show above the tap
      setTooltipY(yPosition - tooltipHeight - 15);
      setPointerBelow(false);
    } else {
      // Show below the tap
      setTooltipY(yPosition + 25);
      setPointerBelow(true);
    }
  }, [height]);

  const QuranPageRenderItem = useCallback(
    ({ item }: { item: number }) => (
      <TouchableOpacity activeOpacity={1} onPress={onTap}>
        <QuranPage
          page={item}
          selectedAyah={selectedAyah}
          setSelectedAyah={setSelectedAyah}
          onWordSelect={handleWordSelect}
          onTap={onTap}
        />
      </TouchableOpacity>
    ),
    [selectedAyah, onTap, handleWordSelect]
  );

  const goToReadingPage = () => {
    router.push({
      pathname: '/selected-ayah',
      params: { selectedAyah: JSON.stringify(selectedAyah) },
    });
  };

  const ayahNumber = selectedAyah ? selectedAyah.split(':')[1] : '';
  const surahName = selectedAyah ? getSurahName(selectedAyah) : '';

  const pages = Array.from({ length: 604 }, (_, index) => index + 1);

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <FlatList
        initialScrollIndex={initialScrollIndex}
        initialNumToRender={1}
        maxToRenderPerBatch={1}
        windowSize={2}
        inverted
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        keyExtractor={(item) => `pageId:${item}`}
        data={pages}
        renderItem={QuranPageRenderItem}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      {/* Speech Bubble Tooltip */}
      {selectedAyah && tooltipY > 0 && (
        <View style={[styles.bubbleContainer, { top: tooltipY }]}>
          {/* Pointer above bubble */}
          {pointerBelow && (
            <View style={[styles.pointer, styles.pointerUp, { borderBottomColor: colors.bgSecondary }]} />
          )}

          <TouchableOpacity
            style={[styles.bubble, { backgroundColor: colors.bgSecondary }]}
            onPress={goToReadingPage}
            activeOpacity={0.95}
          >
            <View style={styles.bubbleHeader}>
              <Text style={[styles.bubbleSurah, { color: colors.textPrimary }]}>
                {surahName}
              </Text>
              <Text style={[styles.bubbleAyah, { color: colors.textSecondary }]}>
                {t('reading.ayah')} {ayahNumber}
              </Text>
            </View>

            <View style={styles.bubbleFooter}>
              {mistakeCount > 0 ? (
                <View style={styles.mistakeInfo}>
                  <Ionicons name="alert-circle" size={14} color={colors.danger} />
                  <Text style={[styles.mistakeText, { color: colors.danger }]}>
                    {mistakeCount} {mistakeCount === 1 ? t('mistakes.mistake') : t('mistakes.mistakesPlural')}
                  </Text>
                </View>
              ) : (
                <View style={styles.mistakeInfo}>
                  <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                  <Text style={[styles.mistakeText, { color: colors.success }]}>
                    {t('mistakes.noMistakes')}
                  </Text>
                </View>
              )}

              <View style={styles.openHint}>
                <Text style={[styles.openText, { color: colors.accent }]}>{t('modal.open')}</Text>
                <Ionicons name="chevron-forward" size={14} color={colors.accent} />
              </View>
            </View>
          </TouchableOpacity>

          {/* Pointer below bubble */}
          {!pointerBelow && (
            <View style={[styles.pointer, styles.pointerDown, { borderTopColor: colors.bgSecondary }]} />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bubbleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 160,
  },
  bubbleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  bubbleSurah: {
    fontWeight: '600',
    fontSize: 15,
  },
  bubbleAyah: {
    fontSize: 13,
  },
  bubbleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  mistakeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  mistakeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  openHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  openText: {
    fontSize: 13,
    fontWeight: '600',
  },
  pointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  pointerUp: {
    borderBottomWidth: 10,
    marginBottom: -1,
  },
  pointerDown: {
    borderTopWidth: 10,
    marginTop: -1,
  },
});

export default QuranPages;
