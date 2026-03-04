declare module '@kmaslesa/holy-quran-word-by-word-min' {
  interface Word {
    codeV1: string;
    ayahKey: string;
  }

  interface Ayah {
    metaData?: {
      lineType?: string;
      suraName?: string;
    };
    words?: Word[];
  }

  interface PageData {
    ayahs?: Ayah[];
  }

  interface QuranWordsNpm {
    getWordsByPage(page: number): Promise<PageData>;
  }

  const quranWordsNpm: QuranWordsNpm;
  export default quranWordsNpm;
}
