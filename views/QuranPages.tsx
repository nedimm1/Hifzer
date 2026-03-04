import { useRouter } from 'expo-router';
import { t } from 'i18next';
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSelector } from 'react-redux';

import QuranPage from './QuranPage';
import { RootState } from '../store';

const { width, height } = Dimensions.get('window');

interface QuranPagesProps {
  route: {
    params: {
      page?: number;
    };
  };
}

const QuranPages: React.FC<QuranPagesProps> = ({ route }) => {
  const router = useRouter();
  const { colors } = useSelector((state: RootState) => state.config);

  const [selectedAyah, setSelectedAyah] = useState<string | null>(null);

  const initialScrollIndex = route.params.page ? route.params.page - 1 : 0;

  const QuranPageRenderItem = useCallback(
    ({ item }: { item: number }) => (
      <QuranPage
        page={item}
        selectedAyah={selectedAyah}
        setSelectedAyah={setSelectedAyah}
      />
    ),
    [selectedAyah]
  );

  const goToReadingPage = () => {
    router.push({
      pathname: '/selected-ayah',
      params: { selectedAyah: JSON.stringify(selectedAyah) },
    });
  };

  const pages = Array.from({ length: 604 }, (_, index) => index + 1);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.bgPrimary,
          marginTop: height > 800 ? 40 : -10,
        },
      ]}
    >
      <FlatList
        viewabilityConfig={{
          itemVisiblePercentThreshold: 30,
        }}
        initialScrollIndex={initialScrollIndex}
        initialNumToRender={1}
        maxToRenderPerBatch={1}
        windowSize={2}
        inverted
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        keyExtractor={(item) => `pageId:${item}`}
        data={pages}
        renderItem={QuranPageRenderItem}
      />
      {selectedAyah && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.openButton,
              { backgroundColor: colors.accent },
            ]}
            onPress={goToReadingPage}
          >
            <Text style={styles.buttonText}>
              {t('open_ayah')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  openButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default QuranPages;
