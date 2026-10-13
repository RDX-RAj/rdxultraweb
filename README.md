# RDX Ultra Web — Infinity Edition

A responsive neon creator portfolio for Editor Raj with a browser music player, YouTube gallery, theme switch, PWA shell, SEO metadata, and a Node.js-powered admin panel.

## Included
- `public/index.html`, `public/styles.css`, `public/app.js`: responsive public site
- `public/admin.html`, `public/admin.css`, `public/admin.js`: content-management interface
- `server.js`: Express API, protected admin session, rate-limited login, validation and JSON persistence
- `data/content.json`: initial profile content
- `public/manifest.json`, `public/sw.js`: installable PWA basics and same-origin offline cache
- SVG icon and social preview artwork

## Run locally or on a Node.js host
Requires Node.js 20+.

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and set strong secrets (details below).
3. Start: `npm start`
4. Visit `/` for the site and `/admin` for the admin panel.

### Required server configuration
Create a long random `SESSION_SECRET` (32+ characters), choose a non-default `ADMIN_USERNAME`, and create a bcrypt password hash. Example hash generation:

```bash
node -e "const b=require('bcryptjs'); console.log(b.hashSync('CHOOSE-A-STRONG-PASSWORD',12))"
```

Put the generated hash into `ADMIN_PASSWORD_HASH` in `.env`. Never publish `.env`, your password, or the hash. Use HTTPS in production. The app deliberately refuses to start without the required secrets. For production deployments with multiple instances, replace Express's in-memory session store with a persistent shared session store and use a persistent writable volume/database for `data/content.json`.

## Admin usage
- Profile form edits tagline, description, email, and social links.
- Music tracks need a direct HTTPS/HTTP audio file URL that you own or have permission to distribute. YouTube watch-page URLs are not direct audio files.
- Videos accept a YouTube video ID or URL.
- The admin session is HttpOnly, SameSite=Lax and Secure in production; login attempts are rate-limited.

## Before launch
1. Replace `https://example.com/` in canonical, structured data, `robots.txt`, `sitemap.xml`, and `.env` with your real domain.
2. Add your real channel URL and licensed audio/video details through Admin.
3. Deploy to a Node.js host; GitHub Pages alone cannot run the backend/Admin API.
4. Use a persistent disk and HTTPS; test the live site and admin login after deployment.

This ZIP contains source files and starter content. It does not include your actual music files or automatically connect to YouTube's API. No third-party analytics or paid service is required by default.
