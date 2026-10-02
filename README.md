# Internship Application Tracker

A single-user CRUD app for tracking internship applications.
React + Vite + Tailwind on the front, Node + Express + SQLite (better-sqlite3) on the back.

## Run it

Requires Node 20+ (developed on Node 22).

```bash
npm install                       # root (concurrently)
npm install --prefix server
npm install --prefix client

npm run seed                      # optional: 8 sample applications
npm run dev                       # API on :3001, app on http://localhost:5173
```

The database is created automatically at `server/data/tracker.db` and migrations run on server start.
`npm run seed` refuses to run on a non-empty table; use `npm run seed -- --force` to add samples anyway.
To start over, stop the server and delete `server/data/tracker.db`.

| Command | What it does |
| --- | --- |
| `npm run dev` | Server (auto-restart) and client together |
| `npm run migrate` | Apply pending migrations |
| `npm run seed` | Insert sample data |
| `npm run build --prefix client` | Production build of the client |

Env vars: `PORT` (default 3001), `DB_PATH` (default `server/data/tracker.db`).

## API

Base path `/api/applications`. Errors always look like `{ "error": { "message": "...", "details": { field: "..." } } }`.

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/` | Optional `?status=interview`. Invalid status → 400 |
| GET | `/stats` | `total`, `interviewing`, `responded`, `response_rate` (0–1) |
| GET | `/:id` | 404 if missing, 400 if id isn't a positive integer |
| POST | `/` | `company`, `role_title`, `status` required. 201 + `Location` header; 422 with per-field `details` |
| PATCH | `/:id` | Partial update; 200, 404, 422, or 400 for an empty body |
| DELETE | `/:id` | 204, or 404 |

Validation: dates must be real `YYYY-MM-DD` dates, `job_url` must be http(s), strings are trimmed and
empty optional strings are stored as `null`.

**Response rate** = applications with status `online_assessment`, `interview`, `offer` or `rejected`
÷ total. `withdrawn` is excluded because it's your decision, not the company's response.
It's defined in one place: `RESPONDED_STATUSES` in `server/src/models/application.js`.

## Structure

```
server/src/
  index.js, app.js        # startup / Express app (auth middleware goes in app.js)
  config.js
  db/                     # connection, migrate.js, migrations/*.sql, seed.js
  models/application.js   # JSDoc typedefs + all SQL
  validation/             # request validation
  controllers/, routes/   # thin HTTP layer
  middleware/             # error handling
client/src/
  api/                    # fetch wrapper
  components/             # table, badges, chips, form, summary cards
  constants/status.js     # status labels and colors (single source on the client)
```

## Data model and extending it

The `applications` table is documented with JSDoc in `server/src/models/application.js`.
Designed so later features are additive:

- **Gmail sync:** `gmail_thread_id` already exists with a unique partial index, so sync can upsert by thread.
  Message history can go in a new `application_events` table without touching `applications`.
- **Reminders:** `follow_up_date` is indexed; a reminder job is a query on it. Richer reminders can be a new table.
- **Auth:** add `app.use('/api', requireAuth)` in `server/src/app.js`; add a `user_id` column via a new migration.
- **Schema changes:** add `server/src/db/migrations/002_*.sql`; it's applied automatically on next start.
  Adding a status means a new migration (SQLite can't alter a CHECK, so rebuild the table) plus `constants/status.js`.
