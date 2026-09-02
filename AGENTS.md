<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project Guidelines & Agent Rules - DOCE Camisetas

These rules must be followed strictly across all development sessions in this codebase:

## 1. TypeScript Standards
- `strict: true` must be enabled in `tsconfig.json`.
- Do NOT use `any` without explicit technical justification. Use strict interfaces, type guards, and generics.

## 2. Environment Variables & Security
- Never hardcode API keys, access tokens, database credentials, or secret keys in source code.
- All secrets must be loaded via `process.env`.
- Always document all required variables in `.env.example` with clean placeholder descriptions.

## 3. Input Validation & Sanitization
- All client inputs (checkout forms, contact details, query parameters, admin login) must be validated and sanitized on BOTH frontend and backend using `zod` schemas.

## 4. Payment Integration Safety (Mercado Pago)
- Use SDK official / Checkout Pro / Checkout Bricks.
- NEVER capture credit card details directly in custom form inputs or pass raw payment numbers to our own backend.
- Keep Mercado Pago `ACCESS_TOKEN` strictly on the backend.
- Payment status (Approved/Pending/Rejected) must be verified via Mercado Pago Webhook / IPN API callbacks before updating DB order states. Never rely on frontend redirects alone.

## 5. Generic Branding Rules
- Do NOT use trademarked club logos, official club names (e.g. Boca, River, Real Madrid), or brand logos (Nike, Adidas, Puma). All naming, images, and copy must be generic and proprietary to "DOCE".

## 6. Testing & Rate Limiting
- Maintain minimum automated tests for cart math, shipping quote logic, and order creation.
- Apply rate limiting middleware to sensitive public endpoints (`/api/checkout/*`, `/api/admin/login`).

## 7. Commits & Quality
- Maintain clean, descriptive commits.
- Ensure all production builds compile without TypeScript errors or broken imports.

