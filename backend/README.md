# CrediSure API

FastAPI API with SQLModel persistence, SQLite demo data, password hashing, and JWT bearer authentication.

`main.py` wires the app together. Database/session setup lives in `core/database.py`, JWT and password handling in `core/security.py`, and user routes, schemas, persistence model, and seed data live under `users/`.

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload
```

Demo login: `admin@credisure.com` / `password123`. Set `SECRET_KEY` and `DATABASE_URL` from `.env.example` before deployment. API docs: http://localhost:8000/docs.
