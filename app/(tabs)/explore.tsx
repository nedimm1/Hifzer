import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';

import { spacing } from '../../constants/spacing';
import { RootState } from '../../store';
import { toggleDarkMode, setTheme, setTranslationLanguage, ThemeName, themeDisplayNames, themes, TranslationLanguage } from '../../store/configSlice';
import { translationLanguages } from '../../services/reading';

const themeOrder: ThemeName[] = ['default', 'mecca', 'medina', 'palestine', 'alAqsa'];

const translationLangOrder: TranslationLanguage[] = ['bs', 'en', 'tr', 'de', 'sq'];

export default function SettingsScreen() {
  const { colors, isDarkMode, themeName, translationLanguage } = useSelector((state: RootState) => state.config);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const handleThemeChange = (theme: ThemeName) => {
    dispatch(setTheme(theme));
  };

  const handleTranslationLanguageChange = (lang: TranslationLanguage) => {
    dispatch(setTranslationLanguage(lang));
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Settings</Text>

      {/* Theme Section */}
      <View style={[styles.section, { borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Theme
        </Text>
        <View style={styles.themeGrid}>
          {themeOrder.map((theme) => {
            const isSelected = themeName === theme;
            const themeColors = themes[theme][isDarkMode ? 'dark' : 'light'];

            return (
              <TouchableOpacity
                key={theme}
                style={[
                  styles.themeCard,
                  {
                    backgroundColor: themeColors.bgSecondary,
                    borderColor: isSelected ? themeColors.accent : colors.border,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
                onPress={() => handleThemeChange(theme)}
                activeOpacity={0.7}
              >
                {/* Color Preview */}
                <View style={styles.colorPreview}>
                  <View
                    style={[
                      styles.colorDot,
                      { backgroundColor: themeColors.accent },
                    ]}
                  />
                  <View
                    style={[
                      styles.colorDot,
                      { backgroundColor: themeColors.bgPrimary },
                    ]}
                  />
                  <View
                    style={[
                      styles.colorDot,
                      { backgroundColor: themeColors.textPrimary },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.themeName,
                    {
                      color: isSelected ? themeColors.accent : colors.textPrimary,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {themeDisplayNames[theme]}
                </Text>
                {isSelected && (
                  <View
                    style={[
                      styles.selectedIndicator,
                      { backgroundColor: themeColors.accent },
                    ]}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Appearance Section */}
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

      {/* App Language Section */}
      <View style={[styles.section, { borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          App Language
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

      {/* Translation Language Section */}
      <View style={[styles.section, { borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Quran Translation
        </Text>
        <View style={styles.translationGrid}>
          {translationLangOrder.map((lang) => {
            const isSelected = translationLanguage === lang;
            const langInfo = translationLanguages[lang];

            return (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.translationButton,
                  {
                    backgroundColor: isSelected ? colors.accent : colors.bgSecondary,
                    borderColor: isSelected ? colors.accent : colors.border,
                  },
                ]}
                onPress={() => handleTranslationLanguageChange(lang)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.translationButtonText,
                    { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                  ]}
                >
                  {langInfo.nativeName}
                </Text>
                <Text
                  style={[
                    styles.translationButtonSubtext,
                    { color: isSelected ? 'rgba(255,255,255,0.7)' : colors.textSecondary },
                  ]}
                >
                  {langInfo.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
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
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  themeCard: {
    width: '30%',
    minWidth: 90,
    aspectRatio: 1,
    borderRadius: 12,
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  colorPreview: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: spacing.sm,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  themeName: {
    fontSize: 12,
    textAlign: 'center',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  translationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  translationButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  translationButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  translationButtonSubtext: {
    fontSize: 10,
    marginTop: 2,
  },
});
