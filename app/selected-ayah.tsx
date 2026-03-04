import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { View, Text, Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { spacing } from '../constants/spacing';
import { RootState } from '../store';

const { width, height } = Dimensions.get('screen');

interface SelectedAyah {
  ayahKey: string;
  // Add other properties as needed
}

const SelectedAyahModal = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ selectedAyah: string }>();
  const { colors } = useSelector((state: RootState) => state.config);

  const selectedAyah: SelectedAyah | null = params.selectedAyah
    ? JSON.parse(params.selectedAyah)
    : null;

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          backgroundColor: colors.bgPrimary,
        },
      ]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Ayah Details
        </Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {selectedAyah ? (
          <Text style={[styles.ayahKey, { color: colors.textPrimary }]}>
            {selectedAyah.ayahKey}
          </Text>
        ) : (
          <Text style={[styles.noAyah, { color: colors.textSecondary }]}>
            No ayah selected
          </Text>
        )}
        {/* TODO: Replace with Reading component */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.md,
  },
  closeButton: {
    padding: spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
  },
  ayahKey: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  noAyah: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default SelectedAyahModal;
