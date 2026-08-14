# Nut Archive API

Spring Boot API for health records and timeline media. Supabase provides PostgreSQL, Auth, and private Storage; this service validates access tokens and uses its service key only on the server to sign Storage URLs.

## Before Running

1. Create a Supabase project. In **Authentication > Providers**, enable Email and create the administrator user with an email and password in **Authentication > Users**. Do not enable public signup.
2. Copy `.env.example` to a private shell configuration or local `.env` file. Do not commit database passwords.
3. Run `src/main/resources/supabase-storage.sql` once in the Supabase SQL Editor to create the private `timeline-media` bucket.
4. Configure `SUPABASE_ADMIN_USER_ID` to that administrator's user UUID and `SUPABASE_SERVICE_ROLE_KEY` from the project API settings.
5. Flyway applies both health and timeline migrations when the service starts. Existing static timeline content is imported idempotently.
4. Ensure JDK 21 and Maven are installed.

## Run

```bash
export SUPABASE_DB_URL='jdbc:postgresql://db.<project-ref>.supabase.co:5432/postgres?sslmode=require'
export SUPABASE_DB_PASSWORD='your-database-password'
export SUPABASE_ISSUER_URI='https://<project-ref>.supabase.co/auth/v1'
export SUPABASE_URL='https://<project-ref>.supabase.co'
export SUPABASE_SERVICE_ROLE_KEY='your-server-only-service-role-key'
export SUPABASE_ADMIN_USER_ID='administrator-user-uuid'
export FRONTEND_ORIGIN='http://localhost:5173'
mvn spring-boot:run
```

## API Contract

Every `/api/health` request requires `Authorization: Bearer <supabase-access-token>`.


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

`GET /api/timeline` is public and returns short-lived signed media URLs. `POST /api/timeline/upload-url`, `POST /api/timeline`, and `DELETE /api/timeline/{id}` require the configured administrator's bearer token. Storage media remains private; only the backend service role signs upload and download URLs.
