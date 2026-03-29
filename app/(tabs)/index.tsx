import quranMetaData from '@kmaslesa/quran-metadata';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  FlatList,
  TextInput,
  StyleSheet,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';

import PageSelectModal from '../../components/PageSelectModal';
import SuraButton from '../../components/SuraButton';
import { RootState } from '../../store';
import { spacing } from '../../constants/spacing';

type ListMode = 'surah' | 'juz';

interface Juz {
  id: number;
  startPage: number;
  endPage: number;
}

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

interface JuzSection {
  juz: Juz;
  surahs: Sura[];
}

const JuzSurahItem = memo(function JuzSurahItem({
  sura,
  onPress,
}: {
  sura: Sura;
  onPress: (page: number) => void;
}) {
  const { t } = useTranslation();
  const { colors } = useSelector((state: RootState) => state.config);

  return (
    <TouchableOpacity
      style={[styles.juzSurahItem, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}
      onPress={() => onPress(sura.startPage)}
      activeOpacity={0.7}
    >
      <View style={[styles.surahIndexBadge, { borderColor: colors.accent }]}>
        <Text style={[styles.surahIndexText, { color: colors.accent }]}>{sura.index}</Text>
      </View>
      <View style={styles.juzSurahInfo}>
        <Text style={[styles.juzSurahName, { color: colors.textPrimary }]}>
          {sura.name.englishTranscription}
        </Text>
        <Text style={[styles.juzSurahMeaning, { color: colors.textSecondary }]}>
          {sura.name.english}
        </Text>
      </View>
      <View style={styles.juzSurahRight}>
        <Text style={[styles.juzSurahArabic, { color: colors.textPrimary }]}>
          {sura.name.arabic}
        </Text>
        <Text style={[styles.juzSurahAyahs, { color: colors.textSecondary }]}>
          {sura.numberOfAyas} {t('home.ayahs')}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

const JuzSectionHeader = memo(function JuzSectionHeader({
  juz,
  onReadJuz,
}: {
  juz: Juz;
  onReadJuz: (page: number) => void;
}) {
  const { t } = useTranslation();
  const { colors } = useSelector((state: RootState) => state.config);

  return (
    <View style={styles.juzSectionHeader}>
      <Text style={[styles.juzSectionTitle, { color: colors.textPrimary }]}>
        {t('home.juz')} {juz.id}
      </Text>
      <TouchableOpacity onPress={() => onReadJuz(juz.startPage)}>
        <Text style={[styles.readJuzLink, { color: colors.accent }]}>
          {t('home.readJuz')}
        </Text>
      </TouchableOpacity>
    </View>
  );
});

const JuzList = memo(function JuzList({
  juzSections,
  onPageSelect,
}: {
  juzSections: JuzSection[];
  onPageSelect: (page: number) => void;
}) {
  const { colors } = useSelector((state: RootState) => state.config);

  return (
    <FlatList
      data={juzSections}
      keyExtractor={(item) => `juzSection:${item.juz.id}`}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => (
        <View style={styles.juzSection}>
          <JuzSectionHeader juz={item.juz} onReadJuz={onPageSelect} />
          {item.surahs.map((sura) => (
            <JuzSurahItem key={sura.index} sura={sura} onPress={onPageSelect} />
          ))}
        </View>
      )}
    />
  );
});

const SuraList = memo(function SuraList({
  surahList,
  setSelectedSura,
  suraSearch,
}: {
  surahList: Sura[];
  setSelectedSura: (sura: Sura) => void;
  suraSearch: string;
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useSelector((state: RootState) => state.config);

  const filteredList = useMemo(() => {
    if (!suraSearch) return surahList;
    return surahList.filter(
      (sura) =>
        String(sura.index).includes(suraSearch) ||
        sura.name.bosnianTranscription
          .toLowerCase()
          .includes(suraSearch.toLowerCase()) ||
        sura.name.englishTranscription
          .toLowerCase()
          .includes(suraSearch.toLowerCase())
    );
  }, [surahList, suraSearch]);

  return (
    <FlatList
      data={filteredList}
      keyExtractor={(item) => `suraId:${item.index}`}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
      keyboardShouldPersistTaps="handled"
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {t('home.noSurahsFound')}
          </Text>
        </View>
      }
      renderItem={({ item: sura }) => (
        <SuraButton
          sura={sura}
          setSelectedSura={setSelectedSura}
          onPageSelect={(page) =>
            router.push({
              pathname: '/quran-pages',
              params: { page },
            })
          }
        />
      )}
    />
  );
});

const SurahListScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors } = useSelector((state: RootState) => state.config);
  const [selectedSura, setSelectedSura] = useState<Sura | null>(null);
  const [suraSearch, setSuraSearch] = useState('');
  const [listMode, setListMode] = useState<ListMode>('surah');

  const surahList = useMemo(() => {
    return quranMetaData.getSuraList();
  }, []);

  const juzList = useMemo(() => {
    return quranMetaData.getJuzList();
  }, []);

  // Create juz sections with their surahs
  const juzSections = useMemo(() => {
    const sections: JuzSection[] = [];

    juzList.forEach((juz: Juz) => {
      // Find surahs that are in this juz
      const surahsInJuz = surahList.filter((sura: Sura) => {
        const startJuz = sura.startJuz ?? 1;
        const endJuz = sura.endJuz ?? 30;
        return startJuz <= juz.id && endJuz >= juz.id;
      });

      sections.push({
        juz,
        surahs: surahsInJuz,
      });
    });

    return sections;
  }, [juzList, surahList]);

  useFocusEffect(
    useCallback(() => {
      setSuraSearch('');
    }, [])
  );

  const handleJuzSelect = useCallback((page: number) => {
    router.push({
      pathname: '/quran-pages',
      params: { page },
    });
  }, [router]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <StatusBar
        barStyle={colors.style === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bgPrimary}
      />

      {selectedSura && (
        <PageSelectModal
          selectedSura={selectedSura}
          onPageSelect={(page) =>
            router.push({
              pathname: '/quran-pages',
              params: { page },
            })
          }
          closeModal={() => setSelectedSura(null)}
        />
      )}

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {t('home.title')}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {listMode === 'surah' ? t('home.subtitle') : t('home.juzSubtitle')}
        </Text>
      </View>

      {/* Search - only for surah mode */}
      {listMode === 'surah' && (
        <View style={styles.searchContainer}>
          <View
            style={[
              styles.searchBox,
              {
                backgroundColor: colors.bgSecondary,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons
              name="search"
              size={20}
              color={colors.textSecondary}
              style={styles.searchIcon}
            />
            <TextInput
              onChangeText={setSuraSearch}
              value={suraSearch}
              placeholder={t('home.searchSurah')}
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholderTextColor={colors.textSecondary}
              returnKeyType="search"
            />
            {suraSearch.length > 0 && (
              <Ionicons
                name="close-circle"
                size={20}
                color={colors.textSecondary}
                onPress={() => setSuraSearch('')}
                style={styles.clearIcon}
              />
            )}
          </View>
        </View>
      )}

      {/* Mode Toggle */}
      <View style={styles.toggleContainer}>
        <View style={[styles.toggleBox, { backgroundColor: colors.bgSecondary }]}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              listMode === 'surah' && { backgroundColor: colors.accent },
            ]}
            onPress={() => setListMode('surah')}
          >
            <Text
              style={[
                styles.toggleText,
                { color: listMode === 'surah' ? '#FFFFFF' : colors.textSecondary },
              ]}
            >
              {t('tabs.surahs')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              listMode === 'juz' && { backgroundColor: colors.accent },
            ]}
            onPress={() => setListMode('juz')}
          >
            <Text
              style={[
                styles.toggleText,
                { color: listMode === 'juz' ? '#FFFFFF' : colors.textSecondary },
              ]}
            >
              {t('home.juz')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* List */}
      {listMode === 'surah' ? (
        <SuraList
          surahList={surahList}
          setSelectedSura={setSelectedSura}
          suraSearch={suraSearch}
        />
      ) : (
        <JuzList
          juzSections={juzSections}
          onPageSelect={handleJuzSelect}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
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
  searchContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  clearIcon: {
    padding: spacing.xs,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: spacing.md,
  },
  toggleContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  toggleBox: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  juzSection: {
    marginBottom: spacing.lg,
  },
  juzSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingVertical: spacing.xs,
  },
  juzSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  readJuzLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  juzSurahItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 10,
    marginBottom: spacing.xs,
    borderWidth: 1,
  },
  surahIndexBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    transform: [{ rotate: '45deg' }],
  },
  surahIndexText: {
    fontSize: 14,
    fontWeight: '700',
    transform: [{ rotate: '-45deg' }],
  },
  juzSurahInfo: {
    flex: 1,
  },
  juzSurahName: {
    fontSize: 15,
    fontWeight: '600',
  },
  juzSurahMeaning: {
    fontSize: 12,
    marginTop: 2,
  },
  juzSurahRight: {
    alignItems: 'flex-end',
  },
  juzSurahArabic: {
    fontSize: 16,
    fontFamily: 'Arabic',
  },
  juzSurahAyahs: {
    fontSize: 11,
    marginTop: 2,
  },
});

export default memo(SurahListScreen);
