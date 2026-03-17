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
              {
                backgroundColor: colors.accent,
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 8,
              },
            ]}
            onPress={goToReadingPage}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>
              {t('open_ayah')} ({selectedAyah})
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    elevation: 1000,
  },
  openButton: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  buttonText: {
    fontWeight: '700',
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default QuranPages;
