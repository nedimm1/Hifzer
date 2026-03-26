import React, { useState } from 'react';
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
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { spacing } from '../constants/spacing';
import { RootState } from '../store';
import { addMistake } from '../store/mistakesSlice';
import { Mistake } from '../types/mistakes';

interface MistakeModalProps {
  visible: boolean;
  word: string;
  wordIndex: number;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  onClose: () => void;
}

const MistakeModal: React.FC<MistakeModalProps> = ({
  visible,
  word,
  wordIndex,
  surahNumber,
  surahName,
  ayahNumber,
  onClose,
}) => {
  const [note, setNote] = useState('');
  const { colors } = useSelector((state: RootState) => state.config);
  const dispatch = useDispatch();

  const handleSave = () => {
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
    setNote('');
    onClose();
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
              <Text style={[styles.title, { color: colors.textPrimary }]}>Mark Mistake</Text>
              <TouchableOpacity
                onPress={handleClose}
                style={[styles.closeButton, { backgroundColor: colors.bgSecondary }]}
              >
                <Ionicons name="close" size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Selected Word Preview */}
            <View style={[styles.wordPreview, { backgroundColor: colors.bgSecondary }]}>
              <Text style={[styles.wordText, { color: colors.danger }]}>{word}</Text>
              <Text style={[styles.reference, { color: colors.textSecondary }]}>
                {surahName} - Ayah {ayahNumber}, Word {wordIndex + 1}
              </Text>
            </View>

            {/* Note Input */}
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              Note (optional)
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
              placeholder="Add a note about this mistake..."
              placeholderTextColor={colors.textSecondary}
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            {/* Buttons */}
            <View style={styles.buttons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
                onPress={handleClose}
              >
                <Text style={[styles.buttonText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton, { backgroundColor: colors.accent }]}
                onPress={handleSave}
              >
                <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Save Mistake</Text>
              </TouchableOpacity>
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
  },
  cancelButton: {
    borderWidth: 1,
  },
  saveButton: {},
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MistakeModal;
