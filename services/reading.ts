import axios from 'axios';

// Translation language codes for quranenc.com API
export const translationLanguages = {
  en: { code: 'english_saheeh', name: 'English', nativeName: 'English' },
  bs: { code: 'bosnian_korkut', name: 'Bosnian', nativeName: 'Bosanski' },
  tr: { code: 'turkish_shahin', name: 'Turkish', nativeName: 'Türkçe' },
  de: { code: 'german_bubenheim', name: 'German', nativeName: 'Deutsch' },
  sq: { code: 'albanian_nahi', name: 'Albanian', nativeName: 'Shqip' },
} as const;

export type TranslationLanguageCode = keyof typeof translationLanguages;

interface TranslationParams {
  surah: number;
  ayah: number;
  translation: string;
}

export const getAyahTranslation = ({
  surah,
  ayah,
  translation,
}: TranslationParams): Promise<any> =>
  new Promise(async (resolve, reject) => {
    try {
      const data = await axios.get(
        `https://quranenc.com/api/translation/aya/${translation}/${surah}/${ayah}`
      );
      resolve(data.data);
    } catch (err) {
      reject(err);
    }
  });
