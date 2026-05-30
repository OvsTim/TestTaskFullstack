/** Valid CUID format that does not exist in the database */
export const NON_EXISTENT_CUID = 'c000000000000000000000000';

export const INVALID_CUID = 'not-a-cuid';

export const validCreateWorkEntry = {
  completedAt: '2026-05-29',
  workName: 'Кладка стены',
  volume: 24,
  unit: 'м³',
  performer: 'Иванов И.И.',
};

export const validCreateMeasurementUnit = {
  name: 'тест-ед',
};
