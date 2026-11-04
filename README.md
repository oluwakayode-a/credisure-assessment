# CrediSure dashboard

Responsive Next.js (App Router) dashboard with NextAuth credentials sign-in; dashboard routes are protected in `src/proxy.ts`. FastAPI serves JWT-authenticated dashboard data backed by SQLModel and SQLite.

## Run locally

Start the API:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python -m users.seed
uvicorn main:app --reload
```

Start the frontend in another terminal:

```bash
cd frontend
pnpm install
cp .env.example .env.local
pnpm dev
```

Run the API tests with `cd backend && uv run pytest`.

Open http://localhost:3000. Seeded demo login: `admin@credisure.com` / `password123` (pre-filled on the login page).

Set a strong `SECRET_KEY` in backend and `AUTH_SECRET` in frontend before deployment. Configure `API_URL`, `NEXT_PUBLIC_API_URL`, and `FRONTEND_ORIGINS` for your deployment hosts.

## Run with Docker

```bash
docker compose up --build
```

Open http://localhost:3000 and sign in with the pre-filled demo account (`admin@credisure.com` / `password123`). The backend container runs `backend/deploy.sh`, which seeds demo data and then starts the API. The API is available at http://localhost:8000 and its docs at http://localhost:8000/docs. The SQLite database is stored in a named Docker volume, so it persists when the containers are stopped or rebuilt.

To stop the containers, press `Ctrl+C` and run `docker compose down`. To remove the database volume too, run `docker compose down --volumes`.

For deployment, set strong `SECRET_KEY` and `AUTH_SECRET` environment variables before starting Compose. The Compose defaults are for local development only.
