import { apiFetch } from './client';
import type { PaginationMeta } from './pagination';

const WORK_ENTRIES_PATH = '/api/work-entries';

/** ISO 8601 date (YYYY-MM-DD), как в CreateWorkEntryDto / QueryWorkEntriesDto */
export type IsoDateString = string;

/** Соответствует WorkEntryResponseDto */
export type WorkEntry = {
  id: string;
  completedAt: string;
  workName: string;
  /** Prisma Decimal в JSON — строка, например "24.00" */
  volume: string;
  unit: string;
  performer: string;
  createdAt: string;
};

/** Название вида работ из справочника (строковый снимок) */
export type CreateWorkEntryBody = {
  completedAt: IsoDateString;
  workName: string;
  volume: number;
  unit: string;
  performer: string;
};

/** @deprecated используйте CreateWorkEntryBody */
export type CreateWorkEntryInput = CreateWorkEntryBody;

export type WorkEntrySort = 'asc' | 'desc';

/** Query GET /api/work-entries — QueryWorkEntriesDto */
export type WorkEntriesQuery = {
  page?: number;
  limit?: number;
  from?: IsoDateString;
  to?: IsoDateString;
  sort?: WorkEntrySort;
};

/** Соответствует PaginatedWorkEntriesResponseDto */
export type PaginatedWorkEntriesResponse = {
  data: WorkEntry[];
  meta: PaginationMeta;
};

/** @deprecated используйте PaginatedWorkEntriesResponse */
export type PaginatedWorkEntries = PaginatedWorkEntriesResponse;

export const WORK_ENTRY_WORK_NAME_MAX_LENGTH = 500;
export const WORK_ENTRY_UNIT_MAX_LENGTH = 50;
export const WORK_ENTRY_PERFORMER_MAX_LENGTH = 200;
export const WORK_ENTRY_VOLUME_MAX = 9_999_999_999.99;

export const WORK_ENTRIES_DEFAULT_PAGE = 1;
export const WORK_ENTRIES_DEFAULT_LIMIT = 20;
export const WORK_ENTRIES_DEFAULT_SORT: WorkEntrySort = 'desc';
export const WORK_ENTRIES_LIMIT_MAX = 100;

function buildWorkEntriesSearchParams(query: WorkEntriesQuery): string {
  const params = new URLSearchParams();

  if (query.page !== undefined) {
    params.set('page', String(query.page));
  }
  if (query.limit !== undefined) {
    params.set('limit', String(query.limit));
  }
  if (query.from) {
    params.set('from', query.from);
  }
  if (query.to) {
    params.set('to', query.to);
  }
  if (query.sort) {
    params.set('sort', query.sort);
  }

  return params.toString();
}

export function fetchWorkEntries(query: WorkEntriesQuery = {}) {
  const qs = buildWorkEntriesSearchParams(query);
  return apiFetch<PaginatedWorkEntriesResponse>(
    `${WORK_ENTRIES_PATH}${qs ? `?${qs}` : ''}`,
  );
}

export function createWorkEntry(body: CreateWorkEntryBody) {
  return apiFetch<WorkEntry>(WORK_ENTRIES_PATH, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function deleteWorkEntry(id: string) {
  return apiFetch<void>(`${WORK_ENTRIES_PATH}/${id}`, { method: 'DELETE' });
}
