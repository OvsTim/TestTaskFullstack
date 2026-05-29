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
```

По умолчанию Postgres в Docker доступен на **localhost:15432**. Порты 5432/5433 на macOS часто заняты локальным PostgreSQL. Свободный порт: `lsof -i :15432`; свой порт — `POSTGRES_PORT` и тот же порт в `DATABASE_URL`.

### 3. Разработка

```bash
pnpm dev
```

- Web: http://localhost:5173  
- API: http://localhost:3000/api  
- Health: http://localhost:3000/api/health  

### Полезные команды

| Команда | Описание |
|---------|----------|
| `pnpm dev` | Запуск web + api (Turborepo) |
| `pnpm build` | Сборка всех приложений |
| `pnpm db:migrate` | Prisma migrate dev |
| `pnpm db:generate` | Генерация Prisma Client |

## API (MVP)

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/work-entries?from=&to=&sort=` | Список записей |
| POST | `/api/work-entries` | Создание записи |
| DELETE | `/api/work-entries/:id` | Удаление |
| GET | `/api/health` | Проверка API |

## Переменные окружения

См. `.env.example`. Для `apps/api` нужен `DATABASE_URL`; для локального фронта прокси `/api` настроен в `apps/web/vite.config.ts`.
