export interface Mistake {
  id: string;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  wordIndex: number;
  wordText: string;
  note: string;
  timestamp: number;
}

export interface MistakeStatistics {
  totalMistakes: number;
  surahsAffected: number;
  mostCommonSurahs: Array<{
    surahNumber: number;
    surahName: string;
    count: number;
  }>;
}
