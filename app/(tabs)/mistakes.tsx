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

import { spacing } from '../../constants/spacing';
import { quranFonts } from '../../data/quranFonts';
import { RootState } from '../../store';
import {
  selectMistakeStatistics,
  selectMistakesGroupedBySurah,
  deleteMistake,
  clearAllMistakes,
  updateMistakeNote,
} from '../../store/mistakesSlice';
import { Mistake } from '../../types/mistakes';
import MistakeModal from '../../components/MistakeModal';

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
  onEdit: () => void;
  onDelete: () => void;
}> = ({ mistake, colors, onEdit, onDelete }) => {
  const handleDelete = () => {
    Alert.alert('Delete Mistake', 'Are you sure you want to delete this mistake?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onDelete },
    ]);
  };

  return (
    <TouchableOpacity
      style={[styles.mistakeCard, { backgroundColor: colors.bgSecondary }]}
      onPress={onEdit}
      activeOpacity={0.7}
    >
      <View style={styles.mistakeHeader}>
        <View style={styles.mistakeInfo}>
          <Text style={[styles.mistakeWord, { color: colors.danger }]}>{mistake.wordText}</Text>
          <Text style={[styles.mistakeReference, { color: colors.textSecondary }]}>
            Ayah {mistake.ayahNumber}, Word {mistake.wordIndex + 1}
          </Text>
        </View>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {mistake.note ? (
        <Text style={[styles.mistakeNote, { color: colors.textPrimary }]}>{mistake.note}</Text>
      ) : (
        <Text style={[styles.mistakeNoNote, { color: colors.textSecondary }]}>
          Tap to add a note
        </Text>
      )}

      <Text style={[styles.mistakeDate, { color: colors.textSecondary }]}>
        {new Date(mistake.timestamp).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );
};

const SurahFolder: React.FC<{
  surahName: string;
  surahNumber: number;
  mistakes: Mistake[];
  colors: any;
  onEditMistake: (mistake: Mistake) => void;
  onDeleteMistake: (id: string) => void;
}> = ({ surahName, surahNumber, mistakes, colors, onEditMistake, onDeleteMistake }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View style={[styles.surahFolder, { backgroundColor: colors.bgSecondary }]}>
      <TouchableOpacity
        style={styles.folderHeader}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.folderTitleContainer}>
          <Ionicons
            name={isExpanded ? 'folder-open' : 'folder'}
            size={22}
            color={colors.accent}
          />
          <Text style={[styles.folderTitle, { color: colors.textPrimary }]}>{surahName}</Text>
        </View>
        <View style={styles.folderRight}>
          <View style={[styles.countBadge, { backgroundColor: colors.danger }]}>
            <Text style={styles.countText}>{mistakes.length}</Text>
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
              onEdit={() => onEditMistake(mistake)}
              onDelete={() => onDeleteMistake(mistake.id)}
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

  const [editingMistake, setEditingMistake] = useState<Mistake | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleDeleteMistake = (id: string) => {
    dispatch(deleteMistake(id));
  };

  const handleEditMistake = (mistake: Mistake) => {
    setEditingMistake(mistake);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMistake(null);
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
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            MISTAKES BY SURAH
          </Text>
          {statistics.totalMistakes > 0 && (
            <TouchableOpacity onPress={handleClearAll}>
              <Text style={[styles.clearAllText, { color: colors.danger }]}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>

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
              onEditMistake={handleEditMistake}
              onDeleteMistake={handleDeleteMistake}
            />
          ))
        )}
      </ScrollView>

      {/* Edit Modal */}
      {editingMistake && (
        <MistakeModal
          visible={showModal}
          word={editingMistake.wordText}
          wordIndex={editingMistake.wordIndex}
          surahNumber={editingMistake.surahNumber}
          surahName={editingMistake.surahName}
          ayahNumber={editingMistake.ayahNumber}
          onClose={handleCloseModal}
          existingMistake={editingMistake}
        />
      )}
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
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
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
  folderTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  folderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  countBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 28,
    alignItems: 'center',
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  folderContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  mistakeCard: {
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  mistakeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  mistakeInfo: {
    flex: 1,
  },
  mistakeWord: {
    fontSize: 24,
    fontFamily: 'Arabic',
  },
  mistakeReference: {
    fontSize: 12,
    marginTop: 2,
  },
  deleteButton: {
    padding: spacing.xs,
  },
  mistakeNote: {
    fontSize: 14,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  mistakeNoNote: {
    fontSize: 14,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  mistakeDate: {
    fontSize: 11,
    marginTop: spacing.sm,
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
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});

export default MistakesScreen;
