# Raghul Babu J — portfolio

React portfolio with a 3D hero, plus a small backend that delivers contact-form
messages to **email and WhatsApp**.

```
src/            the site (all copy lives in src/data.js)
server/         the contact API (Express + Nodemailer + WhatsApp Cloud API)
dist/           build output
```

## Run the site

```bash
npm install
npm run dev          # http://localhost:5173
```

| Script | What it does |
| --- | --- |
| `npm run dev` | dev server with hot reload |
| `npm run build` | production build — small HTML plus split chunks (**use this to host**) |
| `npm run build:single` | everything inlined into one `dist/index.html` (previews only; slower first paint) |
| `npm run preview` | serve the production build locally |
| `npm run server` | start the contact API |

The 3D scene is a separate chunk. It is only downloaded on screens ≥900px with
at least 4 CPU cores and 4 GB of memory, after the page has painted and the
browser is idle — so the text never waits for it.

## Edit your content

Everything is in **[`src/data.js`](src/data.js)**: profile, skills, projects,
experience, websites. Anything set to `null` (GitHub, résumé, WhatsApp) shows a
short reminder instead of a broken link.

- **Photo** → replace `src/assets/photo.jpg` (4:5 portrait, ~1000×1250).
- **Screenshots** → drop files in `src/assets/shots/` and reference them by
  file name in `src/data.js`.
- **Themes** → palettes live in `src/theme.js` and `src/index.css`.

## Contact API

### 1. Configure

```bash
cd server
npm install
cp .env.example .env     # then fill it in
```

**Email (Gmail):** turn on 2-step verification, create an *App password* at
<https://myaccount.google.com/apppasswords>, and set `SMTP_USER` / `SMTP_PASS`.
Any SMTP provider works (Zoho, Brevo, Resend SMTP, your host's mail server).

**WhatsApp:** create an app at <https://developers.facebook.com> → *WhatsApp* →
*API setup*, then copy the temporary token and phone number ID into
`WHATSAPP_TOKEN` and `WHATSAPP_PHONE_ID`, and put your own number (international
format, digits only) in `WHATSAPP_TO`.

> Two things to know about WhatsApp: the test token expires after 24 hours (swap
> in a permanent System User token for production), and outside a 24-hour
> conversation window Meta only delivers **approved templates**. Once your
> template is approved, put its name in `WHATSAPP_TEMPLATE`.

Email and WhatsApp are independent — configure either or both. A message counts
as delivered if at least one of them succeeds.

### 2. Run

```bash
npm run server                      # from the project root
curl http://localhost:8787/api/health
# {"ok":true,"email":true,"whatsapp":false}
```

### 3. Point the site at it

Create `.env` in the project root:

```
VITE_CONTACT_API=http://localhost:8787/api/contact
```

In production use your deployed URL, and set `ALLOWED_ORIGIN` in `server/.env`
to your site's domain so only your site can post to the API.

**If the API is unreachable, nothing breaks** — the form falls back to opening
the visitor's email app with the message pre-filled, and the WhatsApp button
always works through `wa.me` (set `profile.whatsapp` in `src/data.js`).

### What the endpoint does

`POST /api/contact` with `{ name, email, type, message }`:

- rejects bad input (name, email format, message length) with a clear message
- drops spam through a hidden honeypot field
- limits each visitor to 20 submissions per 15 minutes
- emails you the message with **reply-to set to the sender**, so replying goes
  straight back to them
- sends the same summary to WhatsApp
- returns `{ ok: true, email: true, whatsapp: true }` so the form can say where
  it landed

## Deploy

- **Site:** any static host — Netlify, Vercel, Cloudflare Pages, GitHub Pages.
  Upload the contents of `dist/`.
- **API:** any Node host — Render, Railway, Fly.io, a VPS with `pm2`. Set the
  environment variables from `server/.env.example` in the host's dashboard.

## Host it free on GitHub Pages

The repo already contains `.github/workflows/deploy.yml`, which builds the site
and publishes it every time you push to `main`.

### One-time setup

```bash
# 1. create an empty repo on github.com (no README, no .gitignore) — e.g. "portfolio"
# 2. from this folder:
git remote add origin https://github.com/<your-username>/portfolio.git
git push -u origin main
```

Then on GitHub: **Settings → Pages → Build and deployment → Source: GitHub
Actions**. The next push publishes to:

```
https://<your-username>.github.io/portfolio/
```

Want `https://<your-username>.github.io/` instead? Name the repo
`<your-username>.github.io` — everything else is identical. Asset paths are
relative, so both layouts work with no code changes.

Each later change is just:

```bash
git add -A && git commit -m "Update projects" && git push
```

### The contact API needs a separate host

GitHub Pages only serves static files, so `server/` cannot run there. Options:

| Option | Cost | Notes |
| --- | --- | --- |
| **Skip the server** | free | The form opens the visitor's email app and the WhatsApp button still works. Nothing to deploy. |
| **Render** (free web service) | free | Push this repo, set root directory to `server`, start command `npm start`, add the env vars from `server/.env.example`. Free instances sleep when idle, so the first message can take ~30s. |
| **Fly.io / Railway / Koyeb** | free tier | Same idea: a small Node service. |
| **Cloudflare Workers** | free | Needs the endpoint rewritten for the Workers runtime — ask me and I'll port it. |

Once the API is live, add its URL on GitHub under **Settings → Secrets and
variables → Actions → Variables** as `VITE_CONTACT_API`
(e.g. `https://raghul-contact.onrender.com/api/contact`), and set
`ALLOWED_ORIGIN` on the API host to your Pages URL.
