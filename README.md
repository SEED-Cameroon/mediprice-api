# MediPrice API

REST API for MediPrice Cameroon: medication, lab test, and care price transparency. Search a drug, lab test, or service and compare prices across pharmacies, laboratories, and hospitals in Bamenda — every price carries a trust badge (SEED-verified / provider-verified / community-reported) and a last-updated date.

> Full project roadmap: see the MediPrice Internship Guide document. The frontend lives in the mediprice-web repo.

## Tech stack
- Node.js + Express
- MongoDB Atlas + Mongoose
- JWT authentication
- Hosting: Render

## Getting started

```bash
git clone <repo-url>
cd mediprice-api
npm install
cp .env.example .env   # then fill in real values (ask a lead)
npm run dev
```

## API documentation

Document every endpoint here as it is built:

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/health | — | Service health check |
| POST | /api/auth/register | — | Create an account |
| POST | /api/auth/login | — | Get a JWT |
| GET | /api/medications | — | List medications, each with its `prices` (`q`, `category`, `page`, `limit` ≤ 100) |
| GET | /api/medications/:id | — | One medication with its `prices` |
| GET | /api/services | — | List lab tests and care services, each with its `prices` (`q`, `type`, `category`, `page`, `limit` ≤ 100) |
| GET | /api/services/:id | — | One service with its `prices` |
| GET | /api/compare | — | Several items side by side (`itemType=medication\|service`, `ids=id1,id2`; invalid ids are ignored) |
| GET | /api/providers/:id | — | One provider and its `prices`, each with the `item` it's for |

Every price row has `amount`, `trustBadge`, `updatedAt` and `providerId` populated with the provider's `name`, `type`, `quarter`, `address`, `city`, `location` and `phone`. Malformed ids return 404.

## Sample data for development

```bash
npm run seed            # adds sample providers, medications, services and prices to an empty database
npm run seed -- --reset # replaces existing providers, medications, services and prices
```

The seed uses `MONGO_URI` from `.env`, refuses to run when `NODE_ENV=production`, and won't touch a database that already has data unless you pass `--reset`. Provider phone numbers in the sample data are placeholders.


## Branch & PR rules

Read [CONTRIBUTING.md](./CONTRIBUTING.md) before your first commit. Short version: never push to `main`, branch per feature, small PRs, one review required.

## Team

| Role | Name | GitHub |
|------|------|--------|
| Team Lead |  |  |
| Frontend |  |  |
| Backend |  |  |
| UI/UX |  |  |
| QA & Docs |  |  |
