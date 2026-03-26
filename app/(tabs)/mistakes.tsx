import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';

import { spacing } from '../../constants/spacing';
import { RootState } from '../../store';
import {
  selectMistakes,
  selectMistakeStatistics,
  deleteMistake,
  clearAllMistakes,
} from '../../store/mistakesSlice';
import { Mistake } from '../../types/mistakes';

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
  onDelete: () => void;
}> = ({ mistake, colors, onDelete }) => {
  const handleDelete = () => {
    Alert.alert('Delete Mistake', 'Are you sure you want to delete this mistake?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onDelete },
    ]);
  };

  return (
    <View style={[styles.mistakeCard, { backgroundColor: colors.bgSecondary }]}>
      <View style={styles.mistakeHeader}>
        <Text style={[styles.mistakeWord, { color: colors.danger }]}>{mistake.wordText}</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.mistakeReference, { color: colors.textSecondary }]}>
        {mistake.surahName} - Ayah {mistake.ayahNumber}, Word {mistake.wordIndex + 1}
      </Text>

      {mistake.note ? (
        <Text style={[styles.mistakeNote, { color: colors.textPrimary }]}>{mistake.note}</Text>
      ) : null}

      <Text style={[styles.mistakeDate, { color: colors.textSecondary }]}>
        {new Date(mistake.timestamp).toLocaleDateString()}
      </Text>
    </View>
  );
};

const MistakesScreen = () => {
  const { colors } = useSelector((state: RootState) => state.config);
  const mistakes = useSelector(selectMistakes);
  const statistics = useSelector(selectMistakeStatistics);
  const dispatch = useDispatch();

  const handleDeleteMistake = (id: string) => {
    dispatch(deleteMistake(id));
  };

  const handleClearAll = () => {
    if (mistakes.length === 0) return;

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

  const renderHeader = () => (
    <View>
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

      {/* Most Common Surahs */}
      {statistics.mostCommonSurahs.length > 0 && (
        <View style={[styles.section, { backgroundColor: colors.bgSecondary }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            MOST COMMON SURAHS
          </Text>
          {statistics.mostCommonSurahs.map((item) => (
            <View key={item.surahNumber} style={styles.surahRow}>
              <Text style={[styles.surahName, { color: colors.textPrimary }]}>
                {item.surahName}
              </Text>
              <View style={[styles.countBadge, { backgroundColor: colors.danger }]}>
                <Text style={styles.countText}>{item.count}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* All Mistakes Header */}
      <View style={styles.allMistakesHeader}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ALL MISTAKES</Text>
        {mistakes.length > 0 && (
          <TouchableOpacity onPress={handleClearAll}>
            <Text style={[styles.clearAllText, { color: colors.danger }]}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Ionicons name="checkmark-circle" size={64} color={colors.accent} />
      <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No mistakes yet</Text>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        Open an ayah and tap on words to mark mistakes
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <StatusBar
        barStyle={colors.style === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bgPrimary}
      />

      <FlatList
        data={mistakes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MistakeCard
            mistake={item}
            colors={colors}
            onDelete={() => handleDeleteMistake(item.id)}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
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
  section: {
    padding: spacing.lg,
    borderRadius: 16,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  surahRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  surahName: {
    fontSize: 16,
    fontWeight: '500',
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
  allMistakesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  clearAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  mistakeCard: {
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  mistakeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  mistakeWord: {
    fontSize: 28,
    fontWeight: '600',
  },
  deleteButton: {
    padding: spacing.xs,
  },
  mistakeReference: {
    fontSize: 14,
    marginTop: spacing.xs,
  },
  mistakeNote: {
    fontSize: 14,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  mistakeDate: {
    fontSize: 12,
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
