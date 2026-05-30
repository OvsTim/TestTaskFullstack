import { apiFetch } from './client';

export type MeasurementUnit = {
  id: string;
  name: string;
  createdAt: string;
};

export type CreateMeasurementUnitInput = {
  name: string;
};

export type UpdateMeasurementUnitInput = {
  name?: string;
};

export function fetchMeasurementUnits() {
  return apiFetch<MeasurementUnit[]>('/api/measurement-units');
}

export function fetchMeasurementUnit(id: string) {
  return apiFetch<MeasurementUnit>(`/api/measurement-units/${id}`);
}

export function createMeasurementUnit(input: CreateMeasurementUnitInput) {
  return apiFetch<MeasurementUnit>('/api/measurement-units', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateMeasurementUnit(
  id: string,
  input: UpdateMeasurementUnitInput,
) {
  return apiFetch<MeasurementUnit>(`/api/measurement-units/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function deleteMeasurementUnit(id: string) {
  return apiFetch<void>(`/api/measurement-units/${id}`, { method: 'DELETE' });
}
