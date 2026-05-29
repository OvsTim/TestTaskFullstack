import { apiFetch } from './client';

export type WorkEntry = {
  id: string;
  completedAt: string;
  workName: string;
  volume: string;
  unit: string;
  performer: string;
  createdAt: string;
};

export type CreateWorkEntryInput = {
  completedAt: string;
  workName: string;
  volume: number;
  unit: string;
  performer: string;
};

export type WorkEntriesQuery = {
  from?: string;
  to?: string;
  sort?: 'asc' | 'desc';
};

export function fetchWorkEntries(query: WorkEntriesQuery = {}) {
  const params = new URLSearchParams();
  if (query.from) params.set('from', query.from);
  if (query.to) params.set('to', query.to);
  if (query.sort) params.set('sort', query.sort);

  const qs = params.toString();
  return apiFetch<WorkEntry[]>(
    `/api/work-entries${qs ? `?${qs}` : ''}`,
  );
}

export function createWorkEntry(input: CreateWorkEntryInput) {
  return apiFetch<WorkEntry>('/api/work-entries', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function deleteWorkEntry(id: string) {
  return apiFetch<void>(`/api/work-entries/${id}`, { method: 'DELETE' });
}
