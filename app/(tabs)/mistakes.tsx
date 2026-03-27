import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { loadAsync } from 'expo-font';
import { useRouter } from 'expo-router';
import quranMetaData from '@kmaslesa/quran-metadata';

import { spacing } from '../../constants/spacing';
import { quranFonts } from '../../data/quranFonts';
import { RootState } from '../../store';
import {
  selectMistakeStatistics,
  selectMistakesGroupedBySurah,
  clearAllMistakes,
} from '../../store/mistakesSlice';
import { Mistake } from '../../types/mistakes';

const getPageForAyah = (surahNumber: number, ayahNumber: number): number => {
  const suraAyahIndex = quranMetaData.getSuraStartEndAyahIndex(surahNumber);
  const globalAyahIndex = suraAyahIndex.startAyahIndex + ayahNumber;

  for (let page = 1; page <= 604; page++) {
    const pageRange = quranMetaData.getPageStartEndAyahIndex(page);
    if (globalAyahIndex >= pageRange.startAyahIndex && globalAyahIndex <= pageRange.endAyahIndex) {
      return page;
    }
  }

  return 1;
};

const StatCard: React.FC<{
  label: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  colors: any;
}> = ({ label, value, icon, colors }) => (
  <View style={[styles.statCard, { backgroundColor: colors.bgSecondary }]}>
    <Ionicons name={icon} size={24} color={colors.accent} />
    <Text style={[styles.statValue, { color: colors.textPrimary }]}>{value}</Text>
    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
  </View>
);

const MistakeCard: React.FC<{
  mistake: Mistake;
  colors: any;
  onNavigate: () => void;
  arabicFontLoaded: boolean;
}> = ({ mistake, colors, onNavigate, arabicFontLoaded }) => {
  return (
    <TouchableOpacity
      style={[styles.mistakeCard, { backgroundColor: colors.bgPrimary }]}
      onPress={onNavigate}
      activeOpacity={0.7}
    >
      <Text style={[styles.mistakeWord, { color: colors.danger, fontFamily: arabicFontLoaded ? 'Arabic' : undefined }]}>
        {mistake.wordText}
      </Text>
      <View style={styles.mistakeCardRight}>
        <Text style={[styles.mistakeReference, { color: colors.textSecondary }]}>
          {mistake.ayahNumber}:{mistake.wordIndex + 1}
        </Text>
        <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );
};

const SurahFolder: React.FC<{
  surahName: string;
  surahNumber: number;
  mistakes: Mistake[];
  colors: any;
  onNavigateToMistake: (mistake: Mistake) => void;
  arabicFontLoaded: boolean;
}> = ({ surahName, surahNumber, mistakes, colors, onNavigateToMistake, arabicFontLoaded }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View style={[styles.surahFolder, { backgroundColor: colors.bgSecondary }]}>
      <TouchableOpacity
        style={styles.folderHeader}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.folderTitleContainer}>
          <View style={[styles.surahIcon, { backgroundColor: `${colors.accent}15` }]}>
            <Ionicons name="book" size={18} color={colors.accent} />
          </View>
          <Text style={[styles.folderTitle, { color: colors.textPrimary }]}>{surahName}</Text>
        </View>
        <View style={styles.folderRight}>
          <View style={[styles.countBadge, { backgroundColor: `${colors.danger}20` }]}>
            <Text style={[styles.countText, { color: colors.danger }]}>{mistakes.length}</Text>
          </View>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.textSecondary}
          />
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.folderContent}>
          {mistakes.map((mistake) => (
            <MistakeCard
              key={mistake.id}
              mistake={mistake}
              colors={colors}
              onNavigate={() => onNavigateToMistake(mistake)}
              arabicFontLoaded={arabicFontLoaded}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const MistakesScreen = () => {
  const { colors } = useSelector((state: RootState) => state.config);
  const groupedMistakes = useSelector(selectMistakesGroupedBySurah);
  const statistics = useSelector(selectMistakeStatistics);
  const dispatch = useDispatch();
  const router = useRouter();

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

  const handleNavigateToMistake = (mistake: Mistake) => {
    const page = getPageForAyah(mistake.surahNumber, mistake.ayahNumber);
    router.push({
      pathname: '/quran-pages',
      params: { page: page.toString() },
    });
  };

  const handleClearAll = () => {
    if (statistics.totalMistakes === 0) return;

    Alert.alert(
      'Clear All Mistakes',
      'Are you sure you want to delete all mistakes? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => dispatch(clearAllMistakes()),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <StatusBar
        barStyle={colors.style === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bgPrimary}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Mistakes</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Track your recitation progress
          </Text>
        </View>

        {/* Statistics */}
        <View style={styles.statsRow}>
          <StatCard
            label="Total"
            value={statistics.totalMistakes}
            icon="alert-circle"
            colors={colors}
          />
          <StatCard
            label="Surahs"
            value={statistics.surahsAffected}
            icon="book"
            colors={colors}
          />
        </View>

        {/* Surah Folders Header */}
        {groupedMistakes.length > 0 && (
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              By Surah
            </Text>
            <TouchableOpacity onPress={handleClearAll}>
              <Text style={[styles.clearAllText, { color: colors.danger }]}>Clear All</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Surah Folders or Empty State */}
        {groupedMistakes.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle" size={64} color={colors.accent} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No mistakes yet</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Open an ayah and tap on words to mark mistakes
            </Text>
          </View>
        ) : (
          groupedMistakes.map((group) => (
            <SurahFolder
              key={group.surahNumber}
              surahName={group.surahName}
              surahNumber={group.surahNumber}
              mistakes={group.mistakes}
              colors={colors}
              onNavigateToMistake={handleNavigateToMistake}
              arabicFontLoaded={arabicFontLoaded}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  header: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  clearAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  surahFolder: {
    borderRadius: 16,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  folderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
  },
  folderTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  surahIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  folderTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  folderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  countBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
    minWidth: 28,
    alignItems: 'center',
  },
  countText: {
    fontSize: 13,
    fontWeight: '600',
  },
  folderContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  mistakeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
  },
  mistakeCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  mistakeWord: {
    fontSize: 20,
  },
  mistakeReference: {
    fontSize: 13,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: spacing.lg,
  },
  emptyText: {
    fontSize: 14,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});

export default MistakesScreen;
