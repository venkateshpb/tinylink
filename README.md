# TinyLink — URL Shortener (Take-Home Assignment)

This project implements the TinyLink assignment using:

- Next.js (pages router)
- Node.js + API routes (built into Next.js)
- Prisma ORM
- Postgres (Neon or any Postgres)
- Tailwind CSS for UI

## Features

- Create short links with optional custom code
- Redirect `/code` → target URL with click tracking
- Dashboard with:
  - Short code
  - Target URL
  - Total clicks
  - Last clicked time
  - Add and delete actions
  - Filter by code or URL
- Stats page `/code/:code` for a single link
- Healthcheck at `/healthz`

## API Endpoints

- `POST /api/links`  
  - Body: `{ "target": "https://...", "code": "optionalCustomCode" }`  
  - Validates URL and code format `[A-Za-z0-9]{6,8}`  
  - Returns `201` + created link on success  
  - Returns `409` if code already exists  
  - Returns `400` on invalid input

- `GET /api/links`  
  - Lists all links.

- `GET /api/links/:code`  
  - Returns stats for one code (`200`) or `404` if not found.

- `DELETE /api/links/:code`  
  - Deletes a link (`204`) or `404` if not found.

- `GET /healthz`  
  - Returns `200` with JSON: `{ "ok": true, "version": "1.0" }`

## Redirect

- `GET /:code`  
  - Finds link by `code`.  
  - If exists:
    - Increments `clicks`
    - Updates `lastClicked` to current time
    - Issues `302` redirect to the target URL
  - If not found: `404`.

## Local Setup

1. Install dependencies:
   ```bash
   npm install
