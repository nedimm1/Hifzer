import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';

import { spacing } from '../constants/spacing';
import { RootState } from '../store';
import { getSurahTransliteration } from '../utils/surahName';

interface Sura {
  index: number;
  numberOfAyas: number;
  name: {
    arabic: string;
    english: string;
    englishTranscription: string;
    bosnian: string;
    bosnianTranscription: string;
  };
  startPage: number;
  endPage: number;
  totalPages: number;
  type: string;
  startJuz?: number;
  endJuz?: number;
}

interface SuraButtonProps {
  sura: Sura;
  setSelectedSura: (sura: Sura) => void;
  onPageSelect: (page: number) => void;
}

const SuraButton: React.FC<SuraButtonProps> = ({
  sura,
  setSelectedSura,
  onPageSelect,
}) => {
  const { colors } = useSelector((state: RootState) => state.config);
  const { t, i18n } = useTranslation();

  const suraName = getSurahTransliteration(sura.name);

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.bgSecondary }]}
      onPress={() => onPageSelect(sura.startPage)}
      onLongPress={() => setSelectedSura(sura)}
      activeOpacity={0.7}
      accessibilityLabel={`${sura.index}. ${suraName}`}
      accessibilityRole="button"
      accessibilityHint={t('modal.choosePage')}
    >
      {/* Number Badge */}
      <View style={[styles.numberBadge, { backgroundColor: colors.accent }]}>
        <Text style={styles.numberText}>{sura.index}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.leftContent}>
          <Text
            style={[styles.suraName, { color: colors.textPrimary }]}
            numberOfLines={1}
          >
            {suraName}
          </Text>
          <View style={styles.metaRow}>
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {sura.numberOfAyas} {t('home.ayahs')}
            </Text>
            <View style={[styles.dot, { backgroundColor: colors.textSecondary }]} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {sura.type === 'Meccan' ? t('home.meccan') : t('home.medinan')}
            </Text>
          </View>
        </View>

        <View style={styles.rightContent}>
          <Text
            style={[styles.arabicName, { color: colors.accent }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            {sura.name.arabic}
          </Text>
        </View>
      </View>

      {/* Chevron */}
      <Ionicons
        name="chevron-forward"
        size={20}
        color={colors.textSecondary}
        style={styles.chevron}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  numberBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: spacing.md,
  },
  leftContent: {
    flex: 1,
    marginRight: spacing.sm,
  },
  suraName: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    marginHorizontal: 6,
  },
  rightContent: {
    flexShrink: 0,
    maxWidth: '55%',
  },
  arabicName: {
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'right',
  },
  chevron: {
    marginLeft: spacing.sm,
  },
});

export default memo(SuraButton);
