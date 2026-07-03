# Render Deployment Guide

Murmur can run on Render, but the complete Instagram publishing system needs more than a single stateless web service.

## Minimum Production Shape

- Render Web Service: Next.js app.
- MongoDB: MongoDB Atlas is recommended for production.
- Cloudflare R2: stores generated PNG exports behind a public HTTPS URL.
- Meta Instagram app: handles Instagram Login and Content Publishing API access.

This is enough for public submissions, admin moderation, image rendering/upload, manual fallback, and API publishing.

## Recommended Production Shape

- Render Web Service for the Next.js app.
- MongoDB Atlas with backups enabled.
- Cloudflare R2 with a custom public domain.
- Render Cron Job or external scheduler for token refresh and retry checks.
- Error monitoring, such as Sentry or Render log drains.

The app can refresh Instagram tokens during publish, but a scheduled refresh is safer because long-lived tokens still expire.

## Render Web Service Settings

- Build command: `npm install && npm run build`
- Start command: `npm run start`
- Health check path: `/api/health`
- Node version: use the version supported by the Next.js version in `package.json`.

## Required Environment Variables

Copy `.env.example` into Render's Environment tab and fill in real values:

```bash
MONGODB_URI=
ADMIN_PASSWORD=
ADMIN_USERNAME=
ADMIN_SESSION_SECRET=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_BASE_URL=
INSTAGRAM_CLIENT_ID=
INSTAGRAM_CLIENT_SECRET=
INSTAGRAM_REDIRECT_URI=https://YOUR-RENDER-DOMAIN/api/integrations/instagram/callback
INSTAGRAM_SCOPES=instagram_business_basic,instagram_business_content_publish
INSTAGRAM_GRAPH_BASE_URL=https://graph.instagram.com
INSTAGRAM_GRAPH_VERSION=v24.0
```

## What Not To Rely On

- Do not store generated image files on Render's local filesystem; web services are stateless.
- Do not store PNG base64 data in Mongo for production.
- Do not use browser automation for Instagram publishing unless the official API is unavailable and the tool is strictly private/manual.

## Launch Checklist

- `/api/health` returns `status: ok`.
- Admin login works over HTTPS.
- `/admin/settings` shows Instagram env vars as configured.
- Instagram redirect URI exactly matches the Meta app configuration.
- R2 public URL opens a rendered PNG without authentication.
- A rendered approved post can be downloaded.
- Publish failure states are visible in `/admin/posts`.
