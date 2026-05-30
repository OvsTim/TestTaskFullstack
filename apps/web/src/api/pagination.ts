/** Соответствует PaginationMetaDto на бэкенде */
export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
