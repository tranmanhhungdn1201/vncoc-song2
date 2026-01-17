export interface Song {
  id: string;
  index: string;
  titleVn: string;
  titleEn: string;
  lyricsVn: string[];
  lyricsEn: string[];
  chordsVn?: string[];
  chordsEn?: string[];
  theme: string;
  language: string;
  category: string;
  tags: string[];
  hasAudio?: boolean;
  beatUrl?: string; // src1
  vocalUrl?: string; // src2
}

export interface SavedSetlist {
  id: string;
  name: string;
  songs: string[];
  createdAt: number;
}