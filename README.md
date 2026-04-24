# MDEmarine Stitch Site

Static marketing site with an owner console for fast content control.

## What’s included

- `index.html` + service pages (`engine-services.html`, `marine-fabrication.html`, `parts-sales.html`)
- `owner.html` owner console (login, content/theme editor, live preview, publish + rollback, chat panel)
- `site-config.js` default schema
- `site.js` runtime config loader + binder
- `styles.css` public site styles
- `owner.css`, `owner.js` owner console styles/logic

## Owner console (MVP)

Open `owner.html`

Default password:

`mde-owner-2026`

From the owner console you can:

- edit core content + theme values
- upload/swap gallery images (stored as data URLs for quick testing)
- save draft changes
- preview draft live (`index.html?preview=1`)
- publish to live state
- rollback to previous publishes
- use the chat panel UI (set `chat.endpoint` to connect backend)

> This is client-side only. Move auth + publish storage server-side before production.

## Local preview

Open `index.html` and `owner.html` directly, or serve the folder with any static server.

## Deploy (Vercel)

1. Push folder to GitHub.
2. In Vercel, import repo.
3. Framework preset: **Other**.
4. Build command: blank.
5. Output directory: blank.
6. Deploy.

## Next production step (recommended)

- Replace client-side password with real auth.
- Persist drafts/published versions in a database.
- Route chat panel through your backend agent endpoint.
- Add role-based access + audit logs.
