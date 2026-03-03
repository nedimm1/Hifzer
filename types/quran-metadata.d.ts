declare module '@kmaslesa/quran-metadata' {
  interface SuraName {
    arabic: string;
    english: string;
    englishTranscription: string;
    bosnian: string;
    bosnianTranscription: string;
  }

  interface Sura {
    index: number;
    numberOfAyas: number;
    startAyaIndex: number;
    name: SuraName;
    aboutSura: {
      bosnian: string;
    };
    type: string;
    orderInPublishing: number;
    numberOfWords: number;
    numberOfLetters: number;
    startJuz: number;
    endJuz: number;
    startPage: number;
    endPage: number;
    totalPages: number;
  }

  interface QuranMetaData {
    getSuraList(): Sura[];
    getSuraByIndex(index: number): Sura;
    getSuraByPageNumber(pageNumber: number): Sura;
    searchSuraByName(name: string): Sura[];
    searchSuraByBosnianName(name: string): Sura[];
    searchSuraByEnglishName(name: string): Sura[];
    searchSuraByArabicName(name: string): Sura[];
    getJuzByPageNumber(pageNumber: number): any;
    getJuzList(): any[];
    getJuzById(id: number): any;
    getPageInfo(pageNumber: number): any;
  }

  const quranMetaData: QuranMetaData;
  export default quranMetaData;
}
