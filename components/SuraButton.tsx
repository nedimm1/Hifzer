import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';

import {
  borderRadius,
  iconSize,
  spacing,
  typography,
} from '../constants/spacing';
import { RootState } from '../store';

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

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.mainButton,
          {
            backgroundColor: colors.bgSecondary,
          },
        ]}
        onPress={() => onPageSelect(sura.startPage)}
        activeOpacity={0.7}
        accessibilityLabel={`${sura.index}. ${i18n.language === 'bs' ? sura.name.bosnianTranscription : sura.name.englishTranscription}`}
        accessibilityRole="button"
      >
        <View
          style={[
            styles.numberBadge,
            { backgroundColor: colors.accent },
          ]}
        >
          <Text
            style={[
              styles.numberText,
              { color: '#FFFFFF' },
            ]}
          >
            {sura.index}
          </Text>
        </View>
        <View style={styles.textContent}>
          <View style={styles.titleRow}>
            <View style={styles.nameContainer}>
              <Text
                style={[
                  styles.suraName,
                  { color: colors.textPrimary },
                ]}
                numberOfLines={1}
              >
                {i18n.language === 'bs'
                  ? sura.name.bosnianTranscription
                  : sura.name.englishTranscription}
              </Text>
              <Text
                style={[
                  styles.pageInfo,
                  { color: colors.textSecondary },
                ]}
              >
                {t('pages')}: {sura.startPage} - {sura.endPage}
              </Text>
            </View>
            <Text
              style={[
                styles.arabicName,
                { color: colors.accent },
              ]}
            >
              {sura.name.arabic}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.selectButton,
          {
            backgroundColor: colors.accent,
            borderColor: colors.accent,
          },
        ]}
        onPress={() => setSelectedSura(sura)}
        activeOpacity={0.7}
        accessibilityLabel={t('choose_page')}
        accessibilityRole="button"
      >
        <Ionicons
          name="list"
          size={iconSize.sm}
          color="#FFFFFF"
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: spacing.sm,
  },
  mainButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderTopLeftRadius: borderRadius.md,
    borderBottomLeftRadius: borderRadius.md,
    minHeight: 72,
  },
  numberBadge: {
    width: moderateScale(36, 0.2),
    height: moderateScale(36, 0.2),
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  numberText: {
    fontWeight: '700',
    fontSize: typography.fontSize.md,
  },
  textContent: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  nameContainer: {
    flex: 1,
  },
  suraName: {
    fontWeight: '700',
    fontSize: typography.fontSize.md,
  },
  arabicName: {
    fontSize: typography.fontSize.xl,
    textAlign: 'right',
  },
  pageInfo: {
    fontSize: typography.fontSize.sm,
    opacity: 0.8,
  },
  selectButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    borderTopRightRadius: borderRadius.md,
    borderBottomRightRadius: borderRadius.md,
    borderLeftWidth: 2,
    minHeight: 72,
  },
});

export default memo(SuraButton);
