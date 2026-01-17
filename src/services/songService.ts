import { Song } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api/songs';
const API_KEY = import.meta.env.VITE_API_KEY || ''; 

interface ApiSong {
  id: string;
  name1: string;
  name2: string | null;
  seconds1: number | null;
  seconds2: number | null;
  src1: string | null;
  src2: string | null;
  lyric: string; // HTML string
  created_at: string;
  updated_at: string;
}

function parseLyrics(html: string): string[] {
  if (!html) return [];
  
  // Basic HTML cleanup without full DOM parser if server-side, 
  // but since this is client-side, we can use simple regex or DOMParser if we want.
  // Using Regex for simplicity and speed for now.
  
  // Replace <br>, <br/>, <br /> with newline
  const withNewLines = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n') // End of paragraph is a newline
    .replace(/<p>/gi, '') // Start of paragraph can be ignored or treated as separate blocks
    .replace(/&nbsp;/g, ' '); 

  // Strip remaining HTML tags
  const text = withNewLines.replace(/<[^>]*>/g, '');
  
  // Split by newline and trim
  return text.split('\n').map(line => line.trim()).filter(line => line !== '');
}

export async function fetchSongs(): Promise<Song[]> {
  try {
    const response = await fetch(API_URL, {
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch songs: ${response.status}`);
    }

    const data = (await response.json()) as { data: ApiSong[] } | ApiSong[];
    // Handle both wrapped 'data' or direct array if API varies
    const songList = Array.isArray(data) ? data : (data.data || []);

    return songList.map((item) => {
      const lyrics = parseLyrics(item.lyric);
      
      return {
        id: item.id,
        index: item.id, // Using ID as index for now as per "001" format
        titleVn: item.name1,
        titleEn: item.name2 || '',
        lyricsVn: lyrics,
        lyricsEn: [], // API doesn't separate EN lyrics
        chordsVn: [],
        chordsEn: [],
        theme: 'worship',
        language: item.name2 ? 'bilingual' : 'vn',
        category: 'traditional', // Default as requested
        tags: ['worship'],
        hasAudio: !!(item.src1 || item.src2),
        beatUrl: item.src1 || undefined,
        vocalUrl: item.src2 || undefined,
      };
    });
  } catch (error) {
    console.error('Error fetching songs:', error);
    return [];
  }
}
