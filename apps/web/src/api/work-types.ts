import { apiFetch } from './client';

export type WorkType = {
  id: string;
  name: string;
  createdAt: string;
};

export type CreateWorkTypeInput = {
  name: string;
};

export type UpdateWorkTypeInput = {
  name?: string;
};

export function fetchWorkTypes() {
  return apiFetch<WorkType[]>('/api/work-types');
}

export function fetchWorkType(id: string) {
  return apiFetch<WorkType>(`/api/work-types/${id}`);
}

export function createWorkType(input: CreateWorkTypeInput) {
  return apiFetch<WorkType>('/api/work-types', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateWorkType(id: string, input: UpdateWorkTypeInput) {
  return apiFetch<WorkType>(`/api/work-types/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function deleteWorkType(id: string) {
  return apiFetch<void>(`/api/work-types/${id}`, { method: 'DELETE' });
}
