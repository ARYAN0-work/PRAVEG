# PRAVEG — Land Acquisition Risk Dashboard

React/Vite dashboard, Express/Prisma API with PostgreSQL, and a separate Python prediction service. The included workbook has 142 Uttar Pradesh project rows; district pins show approximate district centres, not surveyed parcels.

## Quick start (Windows PowerShell)

Requirements: Node.js 20+, pnpm, Python 3.10+, PostgreSQL 16 (or Docker Desktop).

From the unzipped **project root**:

```powershell
Copy-Item backend/.env.example backend/.env
# If you already run PostgreSQL, edit DATABASE_URL in backend/.env instead.
docker compose up -d db
pnpm install
pnpm -C backend install
pnpm -C frontend install
pnpm -C backend prisma:generate
pnpm -C backend prisma:deploy
pnpm -C backend seed
python -m pip install -r ml-api/requirements.txt
pnpm dev
```

Open http://localhost:5173. Use `http://localhost:5000/health` to check the backend and `http://localhost:5000/api/projects` to check its database connection. The frontend proxies `/api` to `127.0.0.1:5000`.

For an existing PostgreSQL installation, skip `docker compose up` and set its credentials in `backend/.env`. If the database is already populated, you may skip the seed step; `pnpm -C backend seed` is an upsert of workbook project IDs and refreshes matching rows. Avoid `docker compose down -v` if you want to keep your database volume.

If Docker is not installed, create a PostgreSQL database named `praveg`, ensure the account in `DATABASE_URL` can access it, and run the remaining commands. For pnpm on Windows, use `corepack enable` or install pnpm globally if it is not on PATH.

## Services and troubleshooting

| Service | Address | Required for |
| --- | --- | --- |
| Vite | http://localhost:5173 | Frontend |
| Express + PostgreSQL | http://localhost:5000 | Projects, dashboard, map data |
| FastAPI | http://127.0.0.1:8000 | New risk predictions |

If PostgreSQL is unavailable, Express stops and Vite will show a 502 for `/api/projects`. Start PostgreSQL, run the migration, and restart the backend. The prediction API can be temporarily unavailable: projects still save, and their prediction status remains pending until a successful retry on the detail page. The model file is included; model training and model internals are unchanged.

To debug services independently, run in separate terminals: `pnpm dev:backend`, `pnpm dev:frontend`, and `pnpm dev:ml`. The model is loaded relative to `ml-api/predict.py`. If port 5432 is occupied, use your existing PostgreSQL service, or change both `compose.yaml`'s host port and `backend/.env`.

## Data and map limits

The importer reads `ml-api/Datastructure_3.xlsx` from the bundled archive. Blank source values remain null; the importer does not invent compensation percentages or prediction scores. The map uses the included Uttar Pradesh district-centre lookup and OpenStreetMap tiles; tiles need internet access. Markers are grouped per district and colored by the highest saved prediction in that district. Some imported projects may not have complete inputs for a prediction.

## Security and scope

The role selector filters presentation data only; it does not implement authentication. Production deployments need authenticated server-side permissions and appropriate API and database access controls. The sample Docker password and `.env.example` settings are for local development only.
