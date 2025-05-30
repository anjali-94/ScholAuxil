import { Paper } from '../types/models';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

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

export const deletePaper = async (paperId: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/paper/${paperId}/delete`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete paper');
  }
};

export const servePaper = (filepath: string): string => {
  return `${API_BASE_URL}/uploads/${filepath}`;
};