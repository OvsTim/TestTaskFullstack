# Журнал работ (Work Log)

Монорепозиторий для учёта выполненных работ на строительном объекте.

## Стек

| Часть | Технологии |
|-------|------------|
| Монорепа | pnpm workspaces, Turborepo |
| Frontend | Vite, React, TypeScript, Ant Design |
| Backend | NestJS, TypeScript, Prisma |
| БД | PostgreSQL |

**Почему так:** TypeScript на всём стеке, Nest даёт структуру API и валидацию, Prisma — типобезопасный доступ к Postgres, Ant Design ускоряет таблицы и формы, Turborepo — единые `dev`/`build` из корня.

## Структура

```
apps/
  api/    # NestJS + Prisma
  web/    # Vite + React + Ant Design
```

## Быстрый старт

### 1. Зависимости

```bash
cp .env.example .env   # обязательно: Prisma читает DATABASE_URL из корневого .env
pnpm install
```

### 2. База данных

```bash
docker compose up -d db
pnpm db:generate
pnpm db:migrate
pnpm db:seed      # начальные справочники: единицы измерения и виды работ
```

По умолчанию Postgres в Docker доступен на **localhost:15432**. Порты 5432/5433 на macOS часто заняты локальным PostgreSQL. Свободный порт: `lsof -i :15432`; свой порт — `POSTGRES_PORT` и тот же порт в `DATABASE_URL`.

### 3. Разработка

```bash
pnpm dev
```

- Web: http://localhost:5173  
- API: http://localhost:3000/api  
- Swagger UI: http://localhost:3000/api/docs  
- Health: http://localhost:3000/api/health  

### Полезные команды

| Команда | Описание |
|---------|----------|
| `pnpm dev` | Запуск web + api (Turborepo) |
| `pnpm build` | Сборка всех приложений |
| `pnpm db:migrate` | Prisma migrate dev |
| `pnpm db:generate` | Генерация Prisma Client |
| `pnpm db:seed` | Начальные единицы измерения и виды работ в справочниках |

## API (MVP)

Интерактивная документация и тестирование без фронта: **http://localhost:3000/api/docs** (Swagger UI).

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/work-entries?page=&limit=&from=&to=&sort=` | Список записей (с пагинацией) |
| POST | `/api/work-entries` | Создание записи |
| DELETE | `/api/work-entries/:id` | Удаление |
| GET | `/api/work-types` | Список видов работ (справочник) |
| GET | `/api/work-types/:id` | Один вид работ |
| POST | `/api/work-types` | Создать вид работ в справочнике |
| PATCH | `/api/work-types/:id` | Изменить вид работ |
| DELETE | `/api/work-types/:id` | Удалить вид работ |
| GET | `/api/measurement-units` | Список единиц измерения (справочник) |
| GET | `/api/measurement-units/:id` | Одна единица измерения |
| POST | `/api/measurement-units` | Создать единицу в справочнике |
| PATCH | `/api/measurement-units/:id` | Изменить единицу |
| DELETE | `/api/measurement-units/:id` | Удалить единицу |
| GET | `/api/health` | Проверка API |

Query-параметры списка:

| Параметр | По умолчанию | Описание |
|----------|--------------|----------|
| `page` | `1` | Номер страницы (1-based) |
| `limit` | `20` | Записей на странице (1–100) |
| `from` | — | Фильтр: дата выполнения ≥ from (ISO, `2026-05-01`) |
| `to` | — | Фильтр: дата выполнения ≤ to (ISO, `2026-05-31`) |
| `sort` | `desc` | Сортировка по дате: `asc` или `desc` |

Ответ — объект `{ data: WorkEntry[], meta: { total, page, limit, totalPages } }`.

Пример тела POST для записи журнала (Try it out в Swagger):

```json
{
  "completedAt": "2026-05-29",
  "workName": "Кладка стены",
  "volume": 24,
  "unit": "м³",
  "performer": "Иванов И.И."
}
```

Поле `workName` в записи журнала — **строковый снимок** выбранного вида работ из справочника (без FK в БД). Значение должно точно совпадать с `name` из `GET /api/work-types`. При переименовании или удалении вида работ уже созданные записи сохраняют прежнее значение `workName`.

Поле `unit` в записи журнала — **строковый снимок** выбранной единицы из справочника (без FK в БД). При переименовании или удалении единицы в справочнике уже созданные записи сохраняют прежнее значение `unit`.

### Справочник видов работ

Управление справочником — через Swagger (`/api/docs`). На фронте при добавлении записи список подгружается отдельным запросом `GET /api/work-types` и отображается в выпадающем списке.

Пример создания вида работ:

```json
{
  "name": "Кладка стены"
}
```

После `pnpm db:seed` в справочнике уже есть: `Кладка перегородок`, `Монтаж опалубки`, `Кладка стены`, `Бетонирование`, `Арматурные работы`.

### Справочник единиц измерения

Управление справочником — через Swagger (`/api/docs`). На фронте при добавлении записи список подгружается отдельным запросом `GET /api/measurement-units` и отображается в выпадающем списке.

Пример создания единицы:

```json
{
  "name": "м³"
}
```

После `pnpm db:seed` в справочнике уже есть: `м³`, `м²`, `м`, `кг`, `шт`.

## Переменные окружения

См. `.env.example`. Для `apps/api` нужен `DATABASE_URL`; для локального фронта прокси `/api` настроен в `apps/web/vite.config.ts`.
