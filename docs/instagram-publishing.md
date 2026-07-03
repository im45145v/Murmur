# Instagram Publishing Setup

Murmur publishes through Meta's official Instagram Content Publishing API. It does not use browser automation.

## Requirements

- An Instagram professional account, either Business or Creator.
- A Meta developer app with Instagram Login enabled.
- A public callback URL:
  - Local tunneling: `https://YOUR-TUNNEL/api/integrations/instagram/callback`
  - Production: `https://YOUR-APP/api/integrations/instagram/callback`
- Cloudflare R2 with a public bucket URL or custom domain.

## Environment

Set these values in the deployment environment:

```bash
INSTAGRAM_CLIENT_ID=
INSTAGRAM_CLIENT_SECRET=
INSTAGRAM_REDIRECT_URI=https://YOUR-APP/api/integrations/instagram/callback
INSTAGRAM_SCOPES=instagram_business_basic,instagram_business_content_publish
INSTAGRAM_GRAPH_BASE_URL=https://graph.instagram.com
INSTAGRAM_GRAPH_VERSION=v24.0

R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_BASE_URL=https://YOUR-PUBLIC-R2-DOMAIN
```

## Admin Workflow

1. Open `/admin/settings`.
2. Connect Instagram.
3. Approve a submission in `/admin/queue`.
4. Select caption/template/theme/font.
5. Click `Render to R2`.
6. Click `Publish to Instagram`.

If Meta approval or token setup is not ready, use the fallback:

1. Render to R2.
2. Download the PNG.
3. Copy the caption.
4. Post manually in Instagram.
5. Click `Mark as manually posted`.

## Notes

- Instagram publishing requires a public `image_url`; Mongo base64 images are not suitable.
- The token is stored server-side only.
- Publishing failures are written to the generated post and audit log.
- Current export rendering still captures the existing React templates in the browser, then stores the final PNG in R2. The next upgrade should move the renderer fully server-side.
