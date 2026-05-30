import type { StatusValue } from "./constants";

export interface ManhwaEntry {
  id: string;
  user_id: string;
  title: string;
  cover_image: string | null;
  author: string | null;
  genres: string[];
  description: string | null;
  status: StatusValue;
  current_chapter: number;
  total_chapters: number;
  rating: number | null;
  favorite: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type ManhwaInput = Omit<
  ManhwaEntry,
  "id" | "user_id" | "created_at" | "updated_at"
>;