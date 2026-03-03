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
  const { t } = useTranslation();
  const { colors } = useSelector((state: RootState) => state.config);

  const pages = Array.from(
    { length: selectedSura.totalPages },
    (_, i) => selectedSura.startPage + i
  );

  const handlePageSelect = (page: number) => {
    closeModal();
    onPageSelect(page);
  };

  return (
    <Modal
      visible={true}
      transparent
      animationType="fade"
      onRequestClose={closeModal}
    >
      <Pressable style={styles.overlay} onPress={closeModal}>
        <Pressable
          style={[
            styles.modalContainer,
            { backgroundColor: colors.bgPrimary },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              {selectedSura.name.englishTranscription}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {t('selectPage')}
            </Text>
          </View>

          <ScrollView
            style={styles.pagesContainer}
            contentContainerStyle={styles.pagesContent}
          >
            {pages.map((page) => (
              <TouchableOpacity
                key={page}
                onPress={() => handlePageSelect(page)}
                style={[
                  styles.pageButton,
                  {
                    backgroundColor: colors.bgSecondary,
                    borderColor: colors.border,
                  },
                ]}
                activeOpacity={0.7}
              >
                <Text style={[styles.pageText, { color: colors.textPrimary }]}>
                  {page}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            onPress={closeModal}
            style={[
              styles.cancelButton,
              { borderColor: colors.border },
            ]}
          >
            <Text style={[styles.cancelText, { color: colors.textSecondary }]}>
              {t('cancel')}
            </Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContainer: {
    width: '100%',
    maxHeight: '70%',
    borderRadius: 16,
    padding: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
  },
  pagesContainer: {
    maxHeight: 300,
  },
  pagesContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  pageButton: {
    width: 60,
    height: 60,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageText: {
    fontSize: 18,
    fontWeight: '500',
  },
  cancelButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default PageSelectModal;
