// src/services/repositoryService.ts
import { Repository, Paper } from '../types/models';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const fetchRepositories = async (): Promise<Repository[]> => {
  const response = await fetch(`${API_BASE_URL}/repositories`);
  if (!response.ok) throw new Error('Failed to fetch repositories');
  return response.json();
};

export const fetchRepository = async (repoId: number): Promise<Repository> => {
  const response = await fetch(`${API_BASE_URL}/repository/${repoId}`);
  if (!response.ok) throw new Error('Failed to fetch repository');
  return response.json();
};

export const createRepository = async (name: string): Promise<Repository> => {
  const response = await fetch(`${API_BASE_URL}/repository/new`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create repository');
  }
  return response.json();
};

export const deleteRepository = async (repoId: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/repository/${repoId}/delete`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to delete repository');
};

export const uploadPaper = async (
  repoId: number,
  title: string,
  file: File
): Promise<Paper> => {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/paper/upload/${repoId}`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to upload paper');
  }
  return response.json();
};

export const deletePaper = async (paperId: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/paper/${paperId}/delete`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to delete paper');
};

export const fetchPaper = async (paperId: number): Promise<Paper> => {
  const response = await fetch(`${API_BASE_URL}/paper/${paperId}`);
  if (!response.ok) throw new Error('Failed to fetch paper');
  return response.json();
};

export const updatePaper = async (
  paperId: number,
  updates: { notes?: string; last_page_seen?: number | null }
): Promise<Paper> => {
  const response = await fetch(`${API_BASE_URL}/paper/${paperId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to update paper');
  }
  return response.json();
};

export const servePaper = (filepath: string): string => {
  return `${API_BASE_URL}/uploads/${filepath}`;
};