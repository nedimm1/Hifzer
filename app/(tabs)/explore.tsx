import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';

import { spacing } from '../../constants/spacing';
import { RootState } from '../../store';
import { toggleDarkMode } from '../../store/configSlice';

export default function SettingsScreen() {
  const { colors, isDarkMode } = useSelector((state: RootState) => state.config);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Settings</Text>

      <View style={[styles.section, { borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Appearance
        </Text>
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>
            Dark Mode
          </Text>
          <Switch
            value={isDarkMode}
            onValueChange={() => { dispatch(toggleDarkMode()); }}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      <View style={[styles.section, { borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Language
        </Text>
        <View style={styles.languageButtons}>
          <TouchableOpacity
            style={[
              styles.langButton,
              {
                backgroundColor:
                  i18n.language === 'en' ? colors.accent : colors.bgSecondary,
                borderColor: colors.border,
              },
            ]}
            onPress={() => handleLanguageChange('en')}
          >
            <Text
              style={[
                styles.langButtonText,
                { color: i18n.language === 'en' ? '#FFFFFF' : colors.textPrimary },
              ]}
            >
              English
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.langButton,
              {
                backgroundColor:
                  i18n.language === 'bs' ? colors.accent : colors.bgSecondary,
                borderColor: colors.border,
              },
            ]}
            onPress={() => handleLanguageChange('bs')}
          >
            <Text
              style={[
                styles.langButtonText,
                { color: i18n.language === 'bs' ? '#FFFFFF' : colors.textPrimary },
              ]}
            >
              Bosanski
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
  },
  languageButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  langButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    borderWidth: 1,
  },
  langButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
