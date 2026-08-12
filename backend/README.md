# Nut Health API

Spring Boot API for health records. Supabase provides PostgreSQL and user authentication; this service validates the Supabase access token and uses its `sub` claim as the record owner ID.

## Before Running

1. Create a Supabase project and enable email Magic Link authentication.
2. Copy `.env.example` to a private shell configuration or local `.env` file. Do not commit database passwords.
3. Apply `src/main/resources/db/migration/V1__create_health_entries.sql` through Flyway when the service starts.
4. Ensure JDK 21 and Maven are installed.

## Run

```bash
export SUPABASE_DB_URL='jdbc:postgresql://db.<project-ref>.supabase.co:5432/postgres?sslmode=require'
export SUPABASE_DB_PASSWORD='your-database-password'
export SUPABASE_ISSUER_URI='https://<project-ref>.supabase.co/auth/v1'
export FRONTEND_ORIGIN='http://localhost:5173'
mvn spring-boot:run
```

## API Contract

Every `/api/health` request requires `Authorization: Bearer <supabase-access-token>`.

Set `AUTH_ENABLED=false` only for a temporary shared archive. In this mode, anyone who can reach the API can read, add, and delete records. Restore `AUTH_ENABLED=true` before exposing the service publicly.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | List the signed-in user's records by newest date. |
| `GET` | `/api/health?category=BATH` | Filter by `BATH`, `DEWORM`, or `CYCLE`. |
| `POST` | `/api/health` | Create one record. |
| `DELETE` | `/api/health/{id}` | Delete one of the signed-in user's records. |

Create payload:

```json
{
  "category": "BATH",
  "date": "2026-08-03",
  "note": "使用燕麦舒缓洗护"
}
```

The frontend should not connect to the database directly or use a Supabase service key.
