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
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';

import QuranPage from './QuranPage';
import { RootState } from '../store';
import { spacing } from '../constants/spacing';

const { width } = Dimensions.get('window');

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
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
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

      {/* Selected Ayah Button */}
      {selectedAyah && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.openButton, { backgroundColor: colors.accent }]}
            onPress={goToReadingPage}
            activeOpacity={0.8}
          >
            <Ionicons name="book-outline" size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>
              {t('open_ayah')} ({selectedAyah})
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    left: spacing.xl,
    right: spacing.xl,
    zIndex: 1000,
  },
  openButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    fontWeight: '600',
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default QuranPages;
