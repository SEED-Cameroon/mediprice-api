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


## Managing data

Prices are kept up to date by two kinds of account:

| Role | Can do | Badge on their prices |
|---|---|---|
| `admin` (SEED team) | Add, edit and delete medications, services, providers and any price; import spreadsheets; create accounts | `seed_verified` by default (they can choose) |
| `provider` | Update only their own provider's prices and contact details | Always `provider_verified` |

Create the first admin (asks for the password without showing it):

```bash
npm run create-admin -- --email you@example.com --name "Your Name"
```

Admins then create provider accounts from the web app (Admin > Accounts).

### Endpoints

| Method | Endpoint | Who | Description |
|--------|----------|-----|-------------|
| POST | /api/auth/login | anyone | Signs in; sets an httpOnly session cookie |
| POST | /api/auth/logout | anyone | Clears the session cookie |
| GET | /api/auth/me | signed in | The current user |
| GET | /api/prices | admin, provider | Prices you can manage (providers: their own) |
| POST | /api/prices | admin, provider | Add a price, or update it if one exists for that item and provider |
| PATCH | /api/prices/:id | admin, provider | Change amount, badge (admin) or checked date |
| DELETE | /api/prices/:id | admin, provider | Remove a price |
| GET | /api/prices/:id/history | admin, provider | Every change to a price |
| POST | /api/prices/import | admin | Bulk import; `dryRun: true` checks without saving |
| POST, PATCH, DELETE | /api/medications, /api/services | admin | Manage the catalogue |
| POST, DELETE | /api/providers | admin | Manage providers |
| PATCH | /api/providers/:id | admin, that provider | Edit details (providers: phone, quarter, address, location) |
| GET, POST, PATCH, DELETE | /api/users | admin | Manage accounts |

Every price change is saved in `PriceHistory` (old amount, new amount, who, when, and whether it came from an admin, a provider or an import) in the same transaction as the change.

### Spreadsheet import

`POST /api/prices/import` takes `{ rows, dryRun }`, where each row is `{ itemType, item, provider, amount, trustBadge?, checkedAt? }`. Item and provider are matched by name, ignoring case. Unknown names are rejected rather than created, so a typo can't add a duplicate. The web app converts a CSV (`type,item,provider,price_fcfa,trust_badge,checked_on`) into these rows.

### Security

- Passwords are hashed with bcrypt (cost 12).
- Login is limited to 10 attempts per IP per 15 minutes, and an account locks for 15 minutes after 5 failed attempts. Failures always return the same generic message.
- The session is a JWT (HS256) in an httpOnly cookie, `Secure` in production. `SESSION_HOURS` sets its lifetime (default 8).
- Writes must be sent as JSON, which blocks cross-site form posts against the cookie session.
- If the web app is on a different domain from the API, set `COOKIE_SAMESITE=none` (HTTPS only) and list the web app in `CORS_ORIGIN`.
- When the web app forwards `/api` through a Vercel rewrite (as mediprice-web does), set `TRUST_PROXY_HOPS=2`, so the login rate limit sees each visitor's address instead of Vercel's.
- Auth events (logins, failures, lockouts, admin changes) are logged.

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
