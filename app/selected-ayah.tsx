import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { View, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { spacing } from '../constants/spacing';
import { RootState } from '../store';
import Reading from '../views/Reading';

const SelectedAyahModal = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ selectedAyah: string }>();
  const { colors } = useSelector((state: RootState) => state.config);

  // Parse the selectedAyah - it's a JSON-stringified string like "1:5"
  const selectedAyahParam = params.selectedAyah;
  console.log('selected-ayah.tsx - raw param:', selectedAyahParam);
  const selectedAyah: string | null = selectedAyahParam
    ? typeof selectedAyahParam === 'string'
      ? JSON.parse(selectedAyahParam)
      : selectedAyahParam
    : null;
  console.log('selected-ayah.tsx - parsed:', selectedAyah);

  const closeDialog = () => {
    router.back();
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: colors.bgPrimary,
        },
      ]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={closeDialog} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {selectedAyah ? (
          <Reading
            selectedAyah={selectedAyah}
            closeDialog={closeDialog}
          />
        ) : null}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10000,
  },
  closeButton: {
    padding: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 20,
  },
  content: {
    flex: 1,
  },
});

export default SelectedAyahModal;
