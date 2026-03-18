import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { spacing } from '../constants/spacing';
import { RootState } from '../store';
import Reading from '../views/Reading';

const SelectedAyahScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ selectedAyah: string }>();
  const { colors } = useSelector((state: RootState) => state.config);

  const selectedAyahParam = params.selectedAyah;
  const selectedAyah: string | null = selectedAyahParam
    ? typeof selectedAyahParam === 'string'
      ? JSON.parse(selectedAyahParam)
      : selectedAyahParam
    : null;

  const closeDialog = () => {
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <StatusBar
        barStyle={colors.style === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bgPrimary}
      />

      {/* Header */}
      <SafeAreaView style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={closeDialog}
            style={[styles.closeButton, { backgroundColor: colors.bgSecondary }]}
          >
            <Ionicons name="close" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Content */}
      {selectedAyah && <Reading selectedAyah={selectedAyah} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSafeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SelectedAyahScreen;
