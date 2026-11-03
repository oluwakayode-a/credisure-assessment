# CrediSure dashboard

Responsive Next.js dashboard with React Router client navigation and NextAuth credentials sign-in. FastAPI serves JWT-authenticated dashboard data backed by SQLModel and SQLite.

## Run locally

Start the API:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload
```

Start the frontend in another terminal:

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. Seeded demo login: `admin@credisure.com` / `password123`.

Set a strong `SECRET_KEY` in backend and `AUTH_SECRET` in frontend before deployment. Configure `API_URL`, `NEXT_PUBLIC_API_URL`, and `FRONTEND_ORIGINS` for your deployment hosts.
