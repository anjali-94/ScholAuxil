// src/types/models.ts
export interface Repository {
  id: number;
  name: string;
  created_at: string;
  papers?: Paper[];
}

export interface Paper {
  id: number;
  title: string;
  original_filename: string;
  filepath: string;
  uploaded_at: string;
  last_opened?: string;
  last_page_seen?: number | null;
  notes?: string;
  repository_id: number;
  repository?: Repository;
}