import quranMetaData from '@kmaslesa/quran-metadata';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  FlatList,
  TextInput,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';

import PageSelectModal from '../../components/PageSelectModal';
import SuraButton from '../../components/SuraButton';
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

    return (
      <FlatList
        data={surahList}
        keyExtractor={(item) => `suraId:${item.index}`}
        initialNumToRender={114}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item: sura }) => {
          if (
            String(sura.index).includes(suraSearch) ||
            sura.name.bosnianTranscription
              .toLowerCase()
              .includes(suraSearch.toLowerCase()) ||
            sura.name.englishTranscription
              .toLowerCase()
              .includes(suraSearch.toLowerCase())
          ) {
            return (
              <SuraButton
                key={`surabutton:${sura.index}`}
                sura={sura}
                setSelectedSura={setSelectedSura}
                onPageSelect={(page) =>
                  router.push({
                    pathname: '/quran-pages',
                    params: { page },
                  })
                }
              />
            );
          } else {
            return null;
          }
        }}
      />
    );
  }
);

const PageSelect = () => {
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
        padding: 20,
        paddingBottom: 50,
        backgroundColor: colors.bgPrimary,
        height:
          height -
          (Platform.OS === 'ios' ? (height > 800 ? 120 : 40) : 120),
      }}
    >
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
      <View
        style={{
          paddingBottom: 100,
          backgroundColor: colors.bgPrimary,
        }}
      >
        <View style={{ position: 'relative' }}>
          <TextInput
            onChangeText={(value) => setSuraSearch(value)}
            value={suraSearch}
            placeholder={t('sura_search')}
            style={[
              styles.input,
              {
                color: colors.textPrimary,
                borderColor: colors.accent,
              },
            ]}
            placeholderTextColor={colors.textSecondary}
            inputMode="search"
          />
          <Ionicons
            name="search"
            size={moderateScale(16, 0.2)}
            color={colors.textSecondary}
            style={{ position: 'absolute', left: 10, top: 21 }}
          />
        </View>
        <SuraList
          surahList={surahList}
          setSelectedSura={setSelectedSura}
          suraSearch={suraSearch}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    height: 50,
    borderWidth: 1,
    paddingHorizontal: moderateScale(32, 0.2),
    paddingBottom: 0,
    marginVertical: 5,
    width: '100%',
    fontSize: moderateScale(16, 0.2),
    borderRadius: 10,
  },
});

export default memo(PageSelect);
