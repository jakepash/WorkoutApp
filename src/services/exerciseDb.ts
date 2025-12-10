import { CustomExerciseInput } from "../types";

const API_URL = "https://exercisedb.p.rapidapi.com";
const API_KEY = import.meta.env.VITE_EXERCISEDB_API_KEY;
const API_HOST = import.meta.env.VITE_EXERCISEDB_API_HOST || "exercisedb.p.rapidapi.com";

interface ExerciseDbItem {
  id: string;
  name: string;
  bodyPart: string;
  equipment: string;
  gifUrl?: string;
  target?: string;
}

function mapItem(item: ExerciseDbItem): CustomExerciseInput {
  return {
    id: `db_${item.id}`,
    name: item.name,
    bodyPart: item.bodyPart,
    equipment: item.equipment,
    notes: item.target,
    gifUrl: item.gifUrl
  };
}

export async function searchExerciseDb(query: string): Promise<CustomExerciseInput[]> {
  if (!API_KEY) {
    return [];
  }
  const url = `${API_URL}/exercises/name/${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, {
      headers: {
        "X-RapidAPI-Key": API_KEY,
        "X-RapidAPI-Host": API_HOST
      }
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = (await res.json()) as ExerciseDbItem[];
    return data.slice(0, 10).map(mapItem);
  } catch (err) {
    console.error("ExerciseDB search failed", err);
    return [];
  }
}

export async function fetchExerciseGifByName(name: string): Promise<string | null> {
  if (!API_KEY) return null;
  const url = `${API_URL}/exercises/name/${encodeURIComponent(name)}`;
  try {
    const res = await fetch(url, {
      headers: {
        "X-RapidAPI-Key": API_KEY,
        "X-RapidAPI-Host": API_HOST
      }
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = (await res.json()) as ExerciseDbItem[];
    return data[0]?.gifUrl ?? null;
  } catch (err) {
    console.error("ExerciseDB gif fetch failed", err);
    return null;
  }
}

const imageCache = new Map<string, string>();

export async function fetchExerciseImageByName(name: string): Promise<string | null> {
  if (!API_KEY) return null;
  if (imageCache.has(name)) return imageCache.get(name) ?? null;

  // Step 1: find an ID by name
  const searchUrl = `${API_URL}/exercises/name/${encodeURIComponent(name)}`;
  try {
    const searchRes = await fetch(searchUrl, {
      headers: {
        "X-RapidAPI-Key": API_KEY,
        "X-RapidAPI-Host": API_HOST
      }
    });
    if (!searchRes.ok) throw new Error(`status ${searchRes.status}`);
    const data = (await searchRes.json()) as ExerciseDbItem[];
    const best = data?.[0];
    if (!best?.id) return null;

    // Step 2: fetch the image blob
    const imageUrl = `${API_URL}/image?resolution=180&exerciseId=${best.id}`;
    const imgRes = await fetch(imageUrl, {
      headers: {
        "X-RapidAPI-Key": API_KEY,
        "X-RapidAPI-Host": API_HOST
      }
    });
    if (!imgRes.ok) throw new Error(`img status ${imgRes.status}`);
    const blob = await imgRes.blob();
    const objectUrl = URL.createObjectURL(blob);
    imageCache.set(name, objectUrl);
    return objectUrl;
  } catch (err) {
    console.error("ExerciseDB image fetch failed", err);
    return null;
  }
}
