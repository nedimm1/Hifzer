import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import i18n from 'i18next';
import { Ionicons } from '@expo/vector-icons';

import { spacing } from '../../constants/spacing';
import { RootState } from '../../store';
import {
  toggleDarkMode,
  setTheme,
  setTranslationLanguage,
  ThemeName,
  themeDisplayNames,
  themes,
  TranslationLanguage,
} from '../../store/configSlice';
import { translationLanguages } from '../../services/reading';

const themeOrder: ThemeName[] = ['default', 'mecca', 'medina', 'palestine', 'alAqsa'];
const translationLangOrder: TranslationLanguage[] = ['bs', 'en', 'tr', 'de', 'sq'];

export default function SettingsScreen() {
  const { colors, isDarkMode, themeName, translationLanguage } = useSelector(
    (state: RootState) => state.config
  );
  const dispatch = useDispatch();

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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bgPrimary }]}>
      <StatusBar
        barStyle={colors.style === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bgPrimary}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Settings
          </Text>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            APPEARANCE
          </Text>

          {/* Dark Mode Toggle */}
          <View
            style={[styles.settingCard, { backgroundColor: colors.bgSecondary }]}
          >
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View
                  style={[styles.iconContainer, { backgroundColor: colors.accent }]}
                >
                  <Ionicons
                    name={isDarkMode ? 'moon' : 'sunny'}
                    size={18}
                    color="#FFFFFF"
                  />
                </View>
                <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                  Dark Mode
                </Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={() => { dispatch(toggleDarkMode()); }}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* Theme Selection */}
          <View
            style={[styles.settingCard, { backgroundColor: colors.bgSecondary }]}
          >
            <Text style={[styles.cardLabel, { color: colors.textPrimary }]}>
              Theme
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.themeScroll}
            >
              {themeOrder.map((theme) => {
                const isSelected = themeName === theme;
                const themeColors = themes[theme][isDarkMode ? 'dark' : 'light'];

                return (
                  <TouchableOpacity
                    key={theme}
                    style={[
                      styles.themeCard,
                      {
                        backgroundColor: themeColors.bgPrimary,
                        borderColor: isSelected
                          ? themeColors.accent
                          : colors.border,
                        borderWidth: isSelected ? 2 : 1,
                      },
                    ]}
                    onPress={() => handleThemeChange(theme)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.themeAccent,
                        { backgroundColor: themeColors.accent },
                      ]}
                    />
                    <Text
                      style={[
                        styles.themeName,
                        { color: themeColors.textPrimary },
                      ]}
                    >
                      {themeDisplayNames[theme]}
                    </Text>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color={themeColors.accent}
                        style={styles.themeCheck}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>

        {/* Language Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            LANGUAGE
          </Text>

          {/* App Language */}
          <View
            style={[styles.settingCard, { backgroundColor: colors.bgSecondary }]}
          >
            <Text style={[styles.cardLabel, { color: colors.textPrimary }]}>
              App Language
            </Text>
            <View style={styles.buttonGroup}>
              {[
                { code: 'en', label: 'English' },
                { code: 'bs', label: 'Bosanski' },
              ].map((lang) => {
                const isSelected = i18n.language === lang.code;
                return (
                  <TouchableOpacity
                    key={lang.code}
                    style={[
                      styles.langButton,
                      {
                        backgroundColor: isSelected
                          ? colors.accent
                          : colors.bgPrimary,
                        borderColor: isSelected ? colors.accent : colors.border,
                      },
                    ]}
                    onPress={() => handleLanguageChange(lang.code)}
                  >
                    <Text
                      style={[
                        styles.langButtonText,
                        { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                      ]}
                    >
                      {lang.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Translation Language */}
          <View
            style={[styles.settingCard, { backgroundColor: colors.bgSecondary }]}
          >
            <Text style={[styles.cardLabel, { color: colors.textPrimary }]}>
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
                        backgroundColor: isSelected
                          ? colors.accent
                          : colors.bgPrimary,
                        borderColor: isSelected ? colors.accent : colors.border,
                      },
                    ]}
                    onPress={() => handleTranslationLanguageChange(lang)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.translationNative,
                        { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                      ]}
                    >
                      {langInfo.nativeName}
                    </Text>
                    <Text
                      style={[
                        styles.translationName,
                        {
                          color: isSelected
                            ? 'rgba(255,255,255,0.7)'
                            : colors.textSecondary,
                        },
                      ]}
                    >
                      {langInfo.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.xl,
  },
  header: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  settingCard: {
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  themeScroll: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  themeCard: {
    width: 80,
    height: 80,
    borderRadius: 12,
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  themeAccent: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    right: spacing.sm,
    height: 24,
    borderRadius: 6,
  },
  themeName: {
    fontSize: 11,
    fontWeight: '500',
  },
  themeCheck: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  langButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  langButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  translationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  translationButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 90,
    alignItems: 'center',
  },
  translationNative: {
    fontSize: 14,
    fontWeight: '600',
  },
  translationName: {
    fontSize: 10,
    marginTop: 2,
  },
  footer: {
    height: 100,
  },
});
