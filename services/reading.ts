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

interface SegmentTiming {
  verse_key: string;
  segments: number[][];
}

export const getAyahTranslation = ({ surah, ayah, translation }: TranslationParams): Promise<any> =>
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

export const getSegments = (chapter: number, ayah: number, reciterId: string): Promise<SegmentTiming> =>
  new Promise(async (resolve, reject) => {
    try {
      const res = await axios.get(
        `https://api.qurancdn.com/api/qdc/audio/reciters/${reciterId}/audio_files?chapter=${chapter}&segments=true`
      );
      const data = res.data.audio_files[0].verse_timings;

      const selectedTiming = data.find(
        (item: SegmentTiming) => item.verse_key === `${chapter}:${ayah}`
      );

      resolve(selectedTiming);
    } catch (error) {
      reject(error);
    }
  });
