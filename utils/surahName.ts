interface SuraName {
  arabic: string;
  english: string;
  englishTranscription: string;
  bosnian: string;
  bosnianTranscription: string;
}

/**
 * Get the transliterated surah name (uses English transliteration for all languages).
 */
export const getSurahTransliteration = (name: SuraName): string => {
  return name.englishTranscription;
};

/**
 * Get the translated surah name (meaning) - uses English for all languages.
 */
export const getSurahTranslation = (name: SuraName): string => {
  return name.english;
};
