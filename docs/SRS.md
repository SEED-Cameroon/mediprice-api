# MediPrice Cameroon — Backend Software Requirements Specification

**Repo:** `mediprice-api` · **Version:** 1.0 · **Audience:** Backend engineering team
**Companion document:** `mediprice-web`'s Frontend SRS (`SRS.md` in that repo) — Section 5 of this document is the contract both sides must agree on.

---

## 1. Introduction

### 1.1 Purpose
This document specifies the backend requirements for MediPrice Cameroon's API: the data it must store, the endpoints it must expose, and the rules it must enforce. `README.md`'s "API documentation" table remains the source of truth for what is *actually already built* — update that table as each endpoint below ships.

### 1.2 Scope
MediPrice Cameroon is a price-transparency platform: search a medication, lab test, or care service and compare prices across pharmacies, laboratories, and hospitals in Bamenda. Every price carries a **trust badge** (`seed_verified` | `provider_verified` | `community_reported`) and a last-updated date.

**In scope for this API (MVP):** medications catalog, labs & services catalog, providers, price comparison.
**In scope, later phase:** provider detail depth, price history, community price reporting (requires auth — see Section 7).
**Out of scope / not specified here:** payments (MediPrice has no billing model), admin moderation tooling beyond what Section 8 flags.

### 1.3 Audience
Backend developers and their lead implementing and reviewing `mediprice-api`. Frontend developers should read this only for the API contract (Section 5).

### 1.4 Definitions
| Term | Meaning |
|---|---|
| Item | A Medication or a Service (lab test / hospital care) — the thing being priced |
| Provider | A pharmacy, laboratory, or hospital that offers an Item at a price |
| Trust badge | The verification level of a price: `seed_verified` (checked by the SEED team), `provider_verified` (confirmed by the provider), `community_reported` (submitted by a user, unverified) |
| Envelope | This org's standard response shape: `{ success: boolean, data: any, message: string }` |

---

## 2. System Overview

### 2.1 Product perspective
`mediprice-api` is a standalone REST API consumed by `mediprice-web`. Unlike LearnHub, this product is **public by design** — most of the API needs no authentication at all this cycle. Auth exists only as scaffolding for the future community-reporting feature (Section 7).

### 2.2 User roles / actors
- **Guest (the only real actor this cycle)** — searches, browses, views detail, compares. No account needed.
- **Registered user** *(Phase 2)* — can submit a community-reported price. Submission does not itself set the trust badge to verified; that requires a SEED/provider review step (open question, Section 8).
- No provider-facing accounts are specified this cycle — providers do not log in to manage their own prices; SEED/admin data entry is assumed (see Section 8).

### 2.3 Tech stack & constraints
- Node.js + Express, MongoDB Atlas + Mongoose, JWT auth (scaffolded in `src/middleware/auth.js`, HS256-pinned, generic 401 on failure — do not change this contract without updating the frontend SRS). Centralized error handling already exists in `src/middleware/errorHandler.js` and returns the envelope shape with `err.stack` only in `development` — do not leak stack traces in `production`.
- Hosting: Render.
- All secrets (`JWT_SECRET`, `MONGO_URI`) from environment variables — never hardcoded, never logged.
- **Note:** `mediprice-web`'s README currently still describes a Supabase/PostgreSQL stack. That is stale/aspirational and does not match this repo. This backend SRS is written against what's actually here — Node/Express/MongoDB/JWT — flag the frontend README to get corrected, but don't let it influence this API's design.

---

## 3. Data Model

| Entity | Key fields | Notes / indexes |
|---|---|---|
| **Medication** | `_id`, `name`, `genericName`, `category`, `description`, `createdAt`, `updatedAt` | Text index on `name`/`genericName` for search. Index on `category`. |
| **Service** | `_id`, `name`, `type` (`lab`\|`care`), `category`, `description`, `createdAt`, `updatedAt` | Text index on `name`. Index on `type`, `category`. Kept as a separate collection from `Medication` since the two browse pages have distinct filter facets. |
| **Provider** | `_id`, `name`, `type` (`pharmacy`\|`lab`\|`hospital`), `quarter`/`address`, `city` (default `Bamenda`), `location` (`{ lat, lng }`), `phone`, `createdAt`, `updatedAt` | Geo index (`2dsphere`) on `location` once distance-based sort/filter (Week 4 depth) is built. |
| **Price** | `_id`, `itemType` (`medication`\|`service`), `itemId` (ref, polymorphic on `itemType`), `provider` (ref Provider), `amount` (integer, FCFA), `trustBadge` (`seed_verified`\|`provider_verified`\|`community_reported`), `reportedBy` (ref User, null unless community-reported), `lastUpdated`, `createdAt` | Compound index on `(itemType, itemId)` for fetching all prices for a detail page. Index on `provider` for the Provider detail page. |
| **PriceHistory** *(Phase 2)* | `_id`, `price` (ref Price) or `(itemType, itemId, provider)`, `amount`, `recordedAt` | Append-only log; write a new row whenever a `Price.amount` changes instead of overwriting history. |
| **User** *(Phase 2 — only needed once community reporting ships)* | `_id`, `name`, `email` (unique), `passwordHash`, `role` (default `user`), `createdAt`, `updatedAt` | Already scaffolded in `src/models/User.js`. Do not wire register/login routes until the community-reporting feature is actually being built — there is no other auth-gated feature in this product yet (see Section 8). |

---

## 4. Functional Requirements

**FR-1 — Medications catalog**
- Public list endpoint: search by name (case-insensitive, partial match), filter by `category`, paginate.
- Detail endpoint: the medication plus **all** its `Price` rows across providers, each with provider name/type, amount, trust badge, and last-updated date — this is the "comparison table," so the API should return it pre-joined rather than making the frontend do N provider look-ups.

**FR-2 — Labs & Services catalog**
- Same shape as FR-1, scoped to `Service` and filtered additionally by `type` (`lab`\|`care`).

**FR-3 — Providers** *(Week 4 scope, spec now so schema is right from the start)*
- Public list/detail: a provider's own page shows every `Price` row where `provider = this provider`, across both medications and services.

**FR-4 — Compare**
- Accepts multiple item ids (same `itemType`) and returns each item's full price-comparison rows in one response, so the frontend can render a side-by-side table without N separate detail calls.

**FR-5 — Price history** *(Phase 2)*
- Returns the `PriceHistory` series for a given item (optionally scoped to one provider) so the frontend can chart a trend.

**FR-6 — Sort & filter depth** *(Week 4 scope)*
- List/detail endpoints support `sort=price_asc|price_desc|distance` and `priceMin`/`priceMax` query params. Distance sort requires a `lat`/`lng` query param from the client (browser geolocation) compared against `Provider.location`.

**FR-7 — Community price reporting** *(Phase 2, auth-gated)*
- A logged-in user can submit a new `Price` row for an existing item/provider pair (or propose a new provider — decide scope before building, see Section 8). New submissions are created with `trustBadge: "community_reported"` and `reportedBy: userId`.
- This is the **only** feature in the entire product that needs a logged-in user. Do not build register/login before this feature is actually scheduled.

**FR-8 — Response contract**
- Every endpoint returns the envelope shape, matching what `errorHandler.js` already does on the error path. Ensure success responses are equally consistent — don't return a bare array from a list endpoint.

---

## 5. API Specification

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | — | Liveness check (already built) |
| GET | `/api/medications` | — | List/search medications; query: `q`, `category`, `page`, `limit`, `sort`, `priceMin`, `priceMax` |
| GET | `/api/medications/:id` | — | Medication detail + comparison rows across providers |
| GET | `/api/services` | — | List/search services; query: `q`, `type`, `category`, `page`, `limit`, `sort`, `priceMin`, `priceMax` |
| GET | `/api/services/:id` | — | Service detail + comparison rows across providers |
| GET | `/api/providers` | — | List providers; query: `type`, `city` *(Week 4)* |
| GET | `/api/providers/:id` | — | Provider detail + all their priced items *(Week 4)* |
| GET | `/api/compare` | — | Query: `itemType`, `ids` (comma-separated) → comparison rows per item |
| GET | `/api/medications/:id/history` | — | Price trend over time *(Phase 2)* |
| GET | `/api/services/:id/history` | — | Price trend over time *(Phase 2)* |
| POST | `/api/prices` | Bearer | Submit a community-reported price *(Phase 2)* |
| POST | `/api/auth/register` | — | Create an account — only needed once FR-7 is scheduled |
| POST | `/api/auth/login` | — | Get a JWT — only needed once FR-7 is scheduled |

---

## 6. Non-Functional Requirements

- **Security:** validate/sanitize all input server-side; use Mongoose query methods exclusively, never string-built queries; rate-limit `POST /api/prices` and the auth endpoints once they exist; never leak stack traces outside `development` (already enforced in `errorHandler.js` — don't regress it).
- **Performance:** paginate every list endpoint; index every filter/sort field (Section 3); pre-join `Price` + `Provider` on detail/compare endpoints rather than requiring N follow-up calls from the frontend.
- **Reliability:** the health check must keep responding even if MongoDB is unreachable (already the case — preserve this).
- **Data quality:** `lastUpdated` on every `Price` row must be trustworthy — update it on every amount change, and surface it prominently since staleness directly affects user trust in the product's core promise.

---

## 7. Phasing

| Phase | Scope |
|---|---|
| **MVP (this cycle)** | Medications (list/search/detail), Services (list/search/detail), Compare |
| **Phase 2 / Week 4** | Providers (list/detail), sort/filter depth (price range, distance), Price history, Community price reporting (+ auth) |

---

## 8. Open Questions / Decisions Needed

1. **Who enters seed/provider-verified prices?** No admin/data-entry endpoint is specified — confirm whether this is a direct-to-database seeding process (script/CSV import) or needs an internal admin API before Phase 2.
2. **Community report moderation** — does a `community_reported` price ever get promoted to `provider_verified`, and if so, who triggers that and through what endpoint? Not specified here; needed before FR-7 is built.
3. **New provider proposals** — can a community report introduce a brand-new provider, or only attach a price to an existing one? Affects the FR-7 request shape.
4. **Distance sort input** — confirm the frontend will always supply `lat`/`lng` via browser geolocation (with a fallback when the user denies permission) before backend commits to requiring it as a query param.
