# Thinkers Afrika Inventory App

Modern Next.js 14 dashboard for Thinkers Afrika’s operations team. The app exposes a PostgreSQL database through Prisma-powered API routes and mirrors the KPI cards and stock table from the original static prototype.

## Tech stack

- Next.js 14 (App Router) + React 18 with TypeScript
- Tailwind CSS for styling
- PostgreSQL + Prisma ORM
- REST-style API routes under `app/api`

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   Copy `.env` and update the `DATABASE_URL` for your PostgreSQL instance, e.g.

   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/inventory_db"
   ```

   Create the `inventory_db` database if it does not already exist.

3. **Run Prisma migrations**

   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

4. **Seed the database with legacy inventory**

   ```bash
   npm run seed
   ```

   The seed script upserts the four real products from the Excel sheet (Hydraulic oil 225, T&T 300T Grease, 30 Amp blade fuse, Amber indicator bulb).

5. **Start the development server**

   ```bash
   npm run dev
   ```

   Navigate to [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Available scripts

| Script            | Description                                         |
| ----------------- | --------------------------------------------------- |
| `npm run dev`     | Starts Next.js in development mode                  |
| `npm run build`   | Creates a production build                          |
| `npm start`       | Runs the production build                           |
| `npm run lint`    | Executes ESLint                                     |
| `npm run seed`    | Seeds the PostgreSQL database via Prisma + ts-node  |

## Project structure

- `src/app/page.tsx` renders the dashboard composed of KPI cards, product table, and product form.
- `src/app/api/*` contains API route handlers for CRUD operations on products and consumption entries.
- `src/lib/prisma.ts` exposes a singleton Prisma client.
- `prisma/schema.prisma` defines the Product and Consumption models (with migrations under `prisma/migrations`).
- `prisma/seed.ts` seeds the database with real domain data.

## Next steps

- Hook up authentication/authorization for multi-role access.
- Expand UI to cover advanced analytics and stock adjustments.
- Add automated tests for API routes and client components.
