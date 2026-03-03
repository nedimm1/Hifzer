import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { spacing } from '../constants/spacing';
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
  const { t } = useTranslation();
  const { colors } = useSelector((state: RootState) => state.config);

  const handlePress = () => {
    if (sura.totalPages === 1) {
      onPageSelect(sura.startPage);
    } else {
      setSelectedSura(sura);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={[
        styles.container,
        {
          backgroundColor: colors.bgSecondary,
          borderColor: colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.indexContainer,
          { backgroundColor: colors.accent },
        ]}
      >
        <Text style={styles.indexText}>{sura.index}</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text
          style={[styles.nameTranscription, { color: colors.textPrimary }]}
        >
          {sura.name.englishTranscription}
        </Text>
        <Text style={[styles.nameEnglish, { color: colors.textSecondary }]}>
          {sura.name.english}
        </Text>
        <Text style={[styles.details, { color: colors.textSecondary }]}>
          {sura.numberOfAyas} {t('verses')} • {t('page')} {sura.startPage}
          {sura.totalPages > 1 ? `-${sura.endPage}` : ''}
        </Text>
      </View>

      <Text style={[styles.arabicName, { color: colors.textPrimary }]}>
        {sura.name.arabic}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
  },
  indexContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  indexText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  infoContainer: {
    flex: 1,
  },
  nameTranscription: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  nameEnglish: {
    fontSize: 13,
    marginBottom: 2,
  },
  details: {
    fontSize: 12,
  },
  arabicName: {
    fontSize: 22,
    fontWeight: '500',
    marginLeft: spacing.md,
  },
});

export default SuraButton;
