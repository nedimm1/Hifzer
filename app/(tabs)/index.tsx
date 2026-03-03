import quranMetaData from '@kmaslesa/quran-metadata';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, FlatList, StyleSheet, Dimensions } from 'react-native';
import { useSelector } from 'react-redux';

import PageSelectModal from '../../components/PageSelectModal';
import SuraButton from '../../components/SuraButton';
import { SearchBar } from '../../components/ui/SearchBar';
import { spacing } from '../../constants/spacing';
import { RootState } from '../../store';

const { height } = Dimensions.get('screen');

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

const SuraList = memo(
  ({
    surahList,
    setSelectedSura,
    suraSearch,
  }: {
    surahList: Sura[];
    setSelectedSura: (sura: Sura) => void;
    suraSearch: string;
  }) => {
    const router = useRouter();

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
        initialNumToRender={20}
        keyboardShouldPersistTaps="handled"
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
        contentContainerStyle={{
          paddingBottom: 250,
        }}
      />
    );
  }
);

export default function QuranPageSelectScreen() {
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
    <View
      style={{
        padding: spacing.xl,
        paddingTop: 60,
        paddingBottom: spacing.xxxl,
        minHeight: height,
        backgroundColor: colors.bgPrimary,
      }}
    >
      <SearchBar
        value={suraSearch}
        onChangeText={(text) => setSuraSearch(text)}
        placeholder={t('search')}
        style={styles.searchBar}
      />
      <SuraList
        surahList={surahList}
        setSelectedSura={setSelectedSura}
        suraSearch={suraSearch}
      />
      {selectedSura && (
        <PageSelectModal
          selectedSura={selectedSura}
          closeModal={() => setSelectedSura(null)}
          onPageSelect={(page) =>
            router.push({
              pathname: '/quran-pages',
              params: { page },
            })
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    marginBottom: spacing.lg,
  },
});
