import React, { useState } from 'react';
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
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import DropDownPicker from 'react-native-dropdown-picker';

import { spacing } from '../../constants/spacing';
import { RootState } from '../../store';
import {
  toggleDarkMode,
  setTheme,
  setTranslationLanguage,
  setAppLanguage,
  ThemeName,
  themeDisplayNames,
  themes,
  TranslationLanguage,
  AppLanguage,
} from '../../store/configSlice';
import { changeLanguage } from '../../i18n';

const themeOrder: ThemeName[] = ['default', 'mecca', 'medina', 'palestine', 'alAqsa'];

const appLanguageItems = [
  { label: '🇬🇧  English', value: 'en' },
  { label: '🇧🇦  Bosanski', value: 'bs' },
  { label: '🇹🇷  Türkçe', value: 'tr' },
  { label: '🇩🇪  Deutsch', value: 'de' },
  { label: '🇦🇱  Shqip', value: 'sq' },
];

const translationLanguageItems = [
  { label: '🇬🇧  English', value: 'en' },
  { label: '🇧🇦  Bosanski', value: 'bs' },
  { label: '🇹🇷  Türkçe', value: 'tr' },
  { label: '🇩🇪  Deutsch', value: 'de' },
  { label: '🇦🇱  Shqip', value: 'sq' },
];

export default function SettingsScreen() {
  const { colors, isDarkMode, themeName, translationLanguage, appLanguage } = useSelector(
    (state: RootState) => state.config
  );
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [appLangOpen, setAppLangOpen] = useState(false);
  const [transLangOpen, setTransLangOpen] = useState(false);
  const [appLangValue, setAppLangValue] = useState<string>(appLanguage);
  const [transLangValue, setTransLangValue] = useState<string>(translationLanguage);

  const handleAppLanguageChange = (value: string | null) => {
    if (value) {
      changeLanguage(value as AppLanguage);
      dispatch(setAppLanguage(value as AppLanguage));
      setAppLangValue(value);
    }
  };

  const handleThemeChange = (theme: ThemeName) => {
    dispatch(setTheme(theme));
  };

  const handleTranslationLanguageChange = (value: string | null) => {
    if (value) {
      dispatch(setTranslationLanguage(value as TranslationLanguage));
      setTransLangValue(value);
    }
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
            {t('settings.title')}
          </Text>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {t('settings.appearance')}
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
              {t('settings.theme')}
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
        <View style={[styles.section, { zIndex: 2000 }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {t('settings.language')}
          </Text>

          {/* App Language */}
          <View
            style={[styles.settingCard, { backgroundColor: colors.bgSecondary, zIndex: 2000 }]}
          >
            <View style={styles.dropdownHeader}>
              <View style={[styles.iconContainer, { backgroundColor: colors.accent }]}>
                <Ionicons name="language" size={18} color="#FFFFFF" />
              </View>
              <Text style={[styles.cardLabel, { color: colors.textPrimary, marginBottom: 0 }]}>
                {t('settings.appLanguage')}
              </Text>
            </View>
            <DropDownPicker
              open={appLangOpen}
              value={appLangValue}
              items={appLanguageItems}
              setOpen={setAppLangOpen}
              setValue={setAppLangValue}
              onSelectItem={(item) => handleAppLanguageChange(item.value as string)}
              style={{
                backgroundColor: colors.bgPrimary,
                borderColor: colors.border,
                borderRadius: 12,
                minHeight: 50,
              }}
              textStyle={{
                color: colors.textPrimary,
                fontSize: 16,
              }}
              dropDownContainerStyle={{
                backgroundColor: colors.bgPrimary,
                borderColor: colors.border,
                borderRadius: 12,
              }}
              listItemLabelStyle={{
                color: colors.textPrimary,
              }}
              selectedItemContainerStyle={{
                backgroundColor: colors.accent + '20',
              }}
              ArrowDownIconComponent={() => (
                <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
              )}
              ArrowUpIconComponent={() => (
                <Ionicons name="chevron-up" size={20} color={colors.accent} />
              )}
              TickIconComponent={() => (
                <Ionicons name="checkmark" size={18} color={colors.accent} />
              )}
              zIndex={2000}
              zIndexInverse={1000}
            />
          </View>

          {/* Translation Language */}
          <View
            style={[styles.settingCard, { backgroundColor: colors.bgSecondary, zIndex: 1000 }]}
          >
            <View style={styles.dropdownHeader}>
              <View style={[styles.iconContainer, { backgroundColor: colors.accent }]}>
                <Ionicons name="book" size={18} color="#FFFFFF" />
              </View>
              <Text style={[styles.cardLabel, { color: colors.textPrimary, marginBottom: 0 }]}>
                {t('settings.quranTranslation')}
              </Text>
            </View>
            <DropDownPicker
              open={transLangOpen}
              value={transLangValue}
              items={translationLanguageItems}
              setOpen={setTransLangOpen}
              setValue={setTransLangValue}
              onSelectItem={(item) => handleTranslationLanguageChange(item.value as string)}
              style={{
                backgroundColor: colors.bgPrimary,
                borderColor: colors.border,
                borderRadius: 12,
                minHeight: 50,
              }}
              textStyle={{
                color: colors.textPrimary,
                fontSize: 16,
              }}
              dropDownContainerStyle={{
                backgroundColor: colors.bgPrimary,
                borderColor: colors.border,
                borderRadius: 12,
              }}
              listItemLabelStyle={{
                color: colors.textPrimary,
              }}
              selectedItemContainerStyle={{
                backgroundColor: colors.accent + '20',
              }}
              ArrowDownIconComponent={() => (
                <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
              )}
              ArrowUpIconComponent={() => (
                <Ionicons name="chevron-up" size={20} color={colors.accent} />
              )}
              TickIconComponent={() => (
                <Ionicons name="checkmark" size={18} color={colors.accent} />
              )}
              zIndex={1000}
              zIndexInverse={2000}
            />
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
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
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
  footer: {
    height: 100,
  },
});
