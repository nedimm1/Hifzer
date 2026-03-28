import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { loadAsync } from 'expo-font';
import { useTranslation } from 'react-i18next';

import quranMetaData from '@kmaslesa/quran-metadata';

import { spacing } from '../constants/spacing';
import { quranFonts } from '../data/quranFonts';
import { RootState } from '../store';
import { addMistake, updateMistakeNote, deleteMistake } from '../store/mistakesSlice';
import { Mistake } from '../types/mistakes';
import { getSurahTransliteration } from '../utils/surahName';

interface MistakeModalProps {
  visible: boolean;
  word: string;
  wordIndex: number;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  onClose: () => void;
  existingMistake?: Mistake | null;
}

const MistakeModal: React.FC<MistakeModalProps> = ({
  visible,
  word,
  wordIndex,
  surahNumber,
  surahName,
  ayahNumber,
  onClose,
  existingMistake,
}) => {
  const [note, setNote] = useState('');
  const [arabicFontLoaded, setArabicFontLoaded] = useState(false);
  const { colors } = useSelector((state: RootState) => state.config);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const isEditing = !!existingMistake;

  // Get transliterated surah name
  const sura = quranMetaData.getSuraByIndex(surahNumber);
  const surahNameTransliterated = sura ? getSurahTransliteration(sura.name) : '';

  // Load Arabic font
  useEffect(() => {
    const loadArabicFont = async () => {
      try {
        await loadAsync({ Arabic: quranFonts.Arabic });
        setArabicFontLoaded(true);
      } catch {
        setArabicFontLoaded(true);
      }
    };
    loadArabicFont();
  }, []);

  // Set initial note when editing
  useEffect(() => {
    if (existingMistake) {
      setNote(existingMistake.note);
    } else {
      setNote('');
    }
  }, [existingMistake, visible]);

  const handleSave = () => {
    if (isEditing && existingMistake) {
      // Update existing mistake note
      dispatch(updateMistakeNote({ id: existingMistake.id, note: note.trim() }));
    } else {
      // Create new mistake
      const mistake: Mistake = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        surahNumber,
        surahName,
        ayahNumber,
        wordIndex,
        wordText: word,
        note: note.trim(),
        timestamp: Date.now(),
      };
      dispatch(addMistake(mistake));
    }
    setNote('');
    onClose();
  };

  const handleDelete = () => {
    if (!existingMistake) return;

    Alert.alert(t('mistakeModal.deleteMistake'), t('mistakeModal.deleteConfirm'), [
      { text: t('mistakeModal.cancel'), style: 'cancel' },
      {
        text: t('mistakeModal.delete'),
        style: 'destructive',
        onPress: () => {
          dispatch(deleteMistake(existingMistake.id));
          setNote('');
          onClose();
        },
      },
    ]);
  };

  const handleClose = () => {
    setNote('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable style={styles.overlay} onPress={handleClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <Pressable
            style={[styles.modalContainer, { backgroundColor: colors.bgPrimary }]}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.textPrimary }]}>
                {isEditing ? t('mistakeModal.editMistake') : t('mistakeModal.markMistake')}
              </Text>
              <TouchableOpacity
                onPress={handleClose}
                style={[styles.closeButton, { backgroundColor: colors.bgSecondary }]}
              >
                <Ionicons name="close" size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Selected Word Preview */}
            <View style={[styles.wordPreview, { backgroundColor: colors.bgSecondary }]}>
              <Text style={[styles.wordText, { color: colors.danger, fontFamily: arabicFontLoaded ? 'Arabic' : undefined }]}>{word}</Text>
              <Text style={[styles.reference, { color: colors.textSecondary }]}>
                {surahNameTransliterated} - {t('mistakeModal.ayah')} {ayahNumber}, {t('mistakeModal.word')} {wordIndex + 1}
              </Text>
            </View>

            {/* Note Input */}
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              {t('mistakeModal.noteOptional')}
            </Text>
            <TextInput
              style={[
                styles.noteInput,
                {
                  backgroundColor: colors.bgSecondary,
                  color: colors.textPrimary,
                  borderColor: colors.border,
                },
              ]}
              placeholder={t('mistakeModal.notePlaceholder')}
              placeholderTextColor={colors.textSecondary}
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            {/* Buttons */}
            <View style={styles.buttons}>
              {isEditing ? (
                <>
                  <TouchableOpacity
                    style={[styles.button, styles.deleteButton, { backgroundColor: colors.danger }]}
                    onPress={handleDelete}
                  >
                    <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.saveButton, { backgroundColor: colors.accent, flex: 2 }]}
                    onPress={handleSave}
                  >
                    <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>{t('mistakeModal.saveChanges')}</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
                    onPress={handleClose}
                  >
                    <Text style={[styles.buttonText, { color: colors.textSecondary }]}>{t('mistakeModal.cancel')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.saveButton, { backgroundColor: colors.accent }]}
                    onPress={handleSave}
                  >
                    <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>{t('mistakeModal.saveMistake')}</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    width: '100%',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 20,
    padding: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordPreview: {
    padding: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  wordText: {
    fontSize: 32,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  reference: {
    fontSize: 14,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: 16,
    minHeight: 100,
    marginBottom: spacing.lg,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  deleteButton: {
    flex: 0,
    width: 48,
  },
  saveButton: {},
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MistakeModal;
