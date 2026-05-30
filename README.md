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

После seed в справочниках уже есть:

- **Виды работ:** `Кладка перегородок`, `Монтаж опалубки`, `Кладка стены`, `Бетонирование`, `Арматурные работы`
- **Единицы измерения:** `м³`, `м²`, `м`, `кг`, `шт`

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

## API

Описание эндпоинтов, query-параметров и примеров тел запросов — в **Swagger UI**: http://localhost:3000/api/docs

CRUD справочников (`work-types`, `measurement-units`) доступен через Swagger. На фронте при создании и редактировании записи подгружаются только списки (`GET /api/work-types`, `GET /api/measurement-units`) для выпадающих списков.

## Модель данных

В `WorkEntry` поля `workName` и `unit` хранятся как **строковые снимки** без внешних ключей на `WorkType` и `MeasurementUnit`. Это сознательное решение: при переименовании или удалении позиции справочника исторические записи журнала сохраняют значения на момент внесения.

При `POST` и `PATCH` API проверяет, что `workName` и `unit` существуют в соответствующих справочниках (точное совпадение по `name`). После сохранения запись больше не привязана к справочнику — denormalized design без изменения схемы при правках справочников.

## Переменные окружения

См. `.env.example`. Для `apps/api` нужен `DATABASE_URL`; для локального фронта прокси `/api` настроен в `apps/web/vite.config.ts`.
