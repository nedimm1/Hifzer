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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';

import PageSelectModal from '../../components/PageSelectModal';
import SuraButton from '../../components/SuraButton';
import { RootState } from '../../store';
import { spacing } from '../../constants/spacing';

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
            No surahs found
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

  const surahList = useMemo(() => {
    return quranMetaData.getSuraList();
  }, []);

  useFocusEffect(
    useCallback(() => {
      setSuraSearch('');
    }, [])
  );

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
          Quran
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          114 Surahs
        </Text>
      </View>

      {/* Search */}
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
            placeholder={t('sura_search')}
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

      {/* Surah List */}
      <SuraList
        surahList={surahList}
        setSelectedSura={setSelectedSura}
        suraSearch={suraSearch}
      />
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
});

export default memo(SurahListScreen);
