# Firebase: create a project and connect it to Artzen

This guide walks through creating a Firebase project and wiring **environment variables** into this Next.js app. It does **not** assume Firebase code is already in the repo—after env setup, implement features per the project plan (Firestore catalog, `/api` routes, admin UI).

## Before you start

- **Hosting:** Artzen is currently built with **`output: "export"`** (static `out/`). A full Firebase “backend” (Route Handlers, Firebase Admin SDK on the server, ISR reading Firestore) requires a **Node-capable** host (e.g. Vercel, Cloud Run, VPS) and **removing** `output: "export"` from `next.config.ts` for that deployment. You can still create the Firebase project and env vars now; flip the config when you deploy server features.
- **Secrets:** Never commit service account JSON or private keys. Use `.env.local` locally and your host’s secret env UI in production.

---

## 1. Create a Firebase project

1. Open [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** (or **Create a project**).
3. Name it (e.g. `artzen-prod`), accept terms, continue.
4. Google Analytics is optional; enable or skip, then **Create project**.

---

## 2. Register a Web app (client SDK)

1. In the project overview, click the **Web** icon **`</>`** — **Add app** → **Web**.
2. App nickname: e.g. `artzen-web`. You do not need Firebase Hosting for this step unless you want it.
3. Copy the **`firebaseConfig`** object values. You will map them to **public** env vars (safe to expose in the browser; they are not secret keys).

Add to **`.env.local`** in the project root (`artzen/`), next to `package.json`:

```bash
# Firebase Web app config (from Project settings → Your apps → SDK setup and configuration)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Optional (only if you use Analytics on the client):

```bash
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

4. In **Project settings** (gear) → **Your apps** → select the web app → **Authorized domains**: add `localhost` (often already there) and your production domain (e.g. `artzen.pk` and your Vercel preview domain if applicable).

---

## 3. Enable Authentication (admin login)

1. In the left menu: **Build** → **Authentication** → **Get started**.
2. **Sign-in method** → enable **Email/Password** (and any others you need later).
3. Create the first admin user: **Users** → **Add user** (save email/password securely).

**Custom admin claim (recommended for `/admin` APIs):**  
The server should treat only users with claim `admin: true` as admins. Setting claims requires the **Admin SDK** (local script or Cloud Function), not the client SDK. After you add `firebase-admin` to the project, run a one-off script that calls `auth.setCustomUserClaims(uid, { admin: true })` for your admin UID. Until that exists, document the UID and plan the script in your implementation phase.

---

## 4. Enable Firestore

1. **Build** → **Firestore Database** → **Create database**.
2. Choose a **location** (cannot be changed later easily; pick closest to Pakistan users if that’s your market).
3. Start in **production mode** (you will tighten rules) or **test mode** only for local experiments—**do not** leave test rules open in production.

**Suggested collections** (align with implementation):

- `products` — storefront + admin CRUD  
- `collections` — storefront + admin CRUD  
- `orders` — created at checkout; admin read/update status  

Write **security rules** that:

- Allow **public read** only for published catalog fields you need on the site.  
- Restrict **writes** on catalog to admins (via Admin SDK from your API routes, or rules keyed on `request.auth.token.admin == true`).  
- Allow **order creation** only in a controlled way (prefer **server-side** `POST /api/orders` using Admin SDK rather than wide-open client writes).

---

## 5. Enable Storage (product images / uploads)

1. **Build** → **Storage** → **Get started** → same region as Firestore if possible.
2. **Rules:** default locked down; allow **public read** only for paths you intend to hotlink (e.g. `products/**`), and **writes** only through your backend (Admin SDK) or authenticated admin with strict rules.

If you use `next/image` with Storage URLs later, add `images.remotePatterns` in `next.config.ts` for your `firebasestorage.googleapis.com` host.

---

## 6. Service account (server / Admin SDK)

For **Route Handlers**, **server components** that use Admin, and **seed scripts**:

1. **Project settings** → **Service accounts**.
2. **Generate new private key** → download the JSON file.
3. **Do not** commit this file. Add `firebase-adminsdk-*.json` to `.gitignore` if you store it on disk.

**Option A — JSON as a single env var (common on Vercel):**

```bash
# Entire JSON minified to one line, or use your host's "multiline" secret support
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
```

**Option B — path to file (local dev only):**

```bash
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/serviceAccount.json
```

Your server code should initialize `firebase-admin` with `credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!))` or `applicationDefault()` when `GOOGLE_APPLICATION_CREDENTIALS` is set.

Set **`FIREBASE_STORAGE_BUCKET`** (e.g. `your-project.appspot.com`) on the server if the default bucket name is not detected — required for admin image uploads via `/api/admin/upload`.

---

## 7. Copy env vars to your host

On **Vercel**, **Netlify**, **Cloudflare**, etc.:

1. Add all **`NEXT_PUBLIC_*`** Firebase variables (client).
2. Add **`FIREBASE_SERVICE_ACCOUNT_KEY`** or configure **`GOOGLE_APPLICATION_CREDENTIALS`** per platform docs.
3. Redeploy after changing env vars.

Keep existing vars such as **`NEXT_PUBLIC_FORMSPREE_ID`** if you still use Formspree alongside Firestore orders.

---

## 8. Optional: Firebase Emulator Suite

For local development without touching production data:

1. Install [Firebase CLI](https://firebase.google.com/docs/cli): `npm install -g firebase-tools`
2. `firebase login` → `firebase init emulators` (Auth, Firestore, Storage as needed).
3. Point the client SDK at emulators when `NODE_ENV === 'development'` (emulator host/ports from CLI output).

Document emulator env vars in code when you add them (e.g. `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true`).

---

## 9. Connect variables to this codebase (implementation checklist)

When you implement Firebase in the repo, you will typically:

| Piece | Purpose |
|--------|--------|
| `firebase` package | Client: Auth, optional direct Firestore/Storage from browser |
| `firebase-admin` package | Server: verify ID tokens, write Firestore/Storage from API routes |
| `src/lib/firebase/client.ts` | Initialize client app with `NEXT_PUBLIC_*` vars |
| `src/lib/firebase/admin.ts` | Initialize admin with service account |
| `src/app/api/**` | Orders, admin CRUD (requires **non-static** Next deployment) |

Until those files exist, completing **sections 1–7** is enough to have a ready Firebase project and env template.

---

## 10. Suggested `.env.example` entries (for later)

When wiring the app, extend [`.env.example`](.env.example) with the same variable **names** as above (values left empty). That keeps onboarding consistent for other developers.

---

## Related docs in this repo

- [README.md](README.md) — current static export and Formspree order flow  
- [ADMIN.md](ADMIN.md) — catalog workflows before Firebase admin UI exists  
- [docs/supabase-migration.md](docs/supabase-migration.md) — alternative backend notes (optional)
