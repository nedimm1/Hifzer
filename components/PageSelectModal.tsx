import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { spacing } from '../constants/spacing';
import { RootState } from '../store';

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
}

interface PageSelectModalProps {
  selectedSura: Sura;
  closeModal: () => void;
  onPageSelect: (page: number) => void;
}

const PageSelectModal: React.FC<PageSelectModalProps> = ({
  selectedSura,
  closeModal,
  onPageSelect,
}) => {
  const { t, i18n } = useTranslation();
  const { colors } = useSelector((state: RootState) => state.config);

  const pages = Array.from(
    { length: selectedSura.totalPages },
    (_, i) => selectedSura.startPage + i
  );

  const handlePageSelect = (page: number) => {
    closeModal();
    onPageSelect(page);
  };

  const suraName =
    i18n.language === 'bs'
      ? selectedSura.name.bosnianTranscription
      : selectedSura.name.englishTranscription;

  return (
    <Modal
      visible={true}
      transparent
      animationType="fade"
      onRequestClose={closeModal}
    >
      <Pressable style={styles.overlay} onPress={closeModal}>
        <Pressable
          style={[styles.modalContainer, { backgroundColor: colors.bgPrimary }]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={[styles.arabicTitle, { color: colors.accent }]}>
                سورة  {selectedSura.name.arabic}
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {t('selectPage')} ({selectedSura.totalPages} {t('pages').toLowerCase()})
              </Text>
            </View>
            <TouchableOpacity
              onPress={closeModal}
              style={[styles.closeButton, { backgroundColor: colors.bgSecondary }]}
            >
              <Ionicons name="close" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Pages Grid */}
          <ScrollView
            style={styles.pagesContainer}
            contentContainerStyle={styles.pagesContent}
            showsVerticalScrollIndicator={false}
          >
            {pages.map((page, index) => (
              <TouchableOpacity
                key={page}
                onPress={() => handlePageSelect(page)}
                style={[
                  styles.pageButton,
                  {
                    backgroundColor: colors.bgSecondary,
                  },
                ]}
                activeOpacity={0.7}
              >
                <Text style={[styles.pageText, { color: colors.textPrimary }]}>
                  {page}
                </Text>
                {index === 0 && (
                  <Text style={[styles.pageLabel, { color: colors.accent }]}>
                    Start
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    maxHeight: '75%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  headerContent: {
    flex: 1,
  },
  arabicTitle: {
    fontSize: 28,
    fontWeight: '500',
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pagesContainer: {
    maxHeight: 320,
  },
  pagesContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  pageButton: {
    width: 64,
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageText: {
    fontSize: 18,
    fontWeight: '600',
  },
  pageLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
});

export default PageSelectModal;
