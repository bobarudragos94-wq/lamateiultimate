# Depozit Construct — PWA pentru depozit de materiale de construcții

Aplicație web modernă (PWA instalabilă) care transformă cererile haotice de pe WhatsApp/telefon în
cereri de ofertă clare, organizate pe statusuri și ușor de urmărit de echipă.

## Funcționalități

**Pentru clienți (fără cont):**
- Landing page de prezentare cu categorii, beneficii și pașii de comandă
- Catalog de produse cu căutare instant și filtrare pe categorii
- Coș de cerere de ofertă: produse + cantități + date de livrare
- Confirmare cu număr de cerere unic (ex. `CMD-2026-AB12C`)

**Pentru angajați / admin (login securizat, roluri ADMIN / STAFF):**
- Dashboard: cereri noi azi, confirmate luna asta, valoare estimată, top produse cerute
- Listă cereri cu filtrare pe status: Nouă → În verificare → Ofertată → Confirmată → Pregătită → Livrată / Anulată
- Detalii cerere: date client, produse, cantități, schimbare status, notițe interne
- Administrare produse (CRUD, preț / „preț la cerere", disponibilitate, dezactivare)
- Administrare categorii
- Audit log pentru acțiunile din admin

## Stack tehnic

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS 4**
- **Turso / libSQL** + **Drizzle ORM** (fallback automat pe fișier SQLite local pentru dezvoltare)
- Autentificare cu sesiune JWT semnată (cookie httpOnly) + middleware pe rutele `/admin`
- PWA: manifest, service worker, iconuri maskable, theme color
- Validare cu **Zod**, notificări cu **sonner**, state coș cu **zustand** (persistat în localStorage)

## Rulare locală

```bash
# 1. Instalează dependențele
npm install

# 2. Configurează variabilele de mediu
cp .env.example .env
# Editează .env — pentru dezvoltare locală poți lăsa TURSO_DATABASE_URL gol
# (se folosește automat fișierul local.db). Setează un AUTH_SECRET oarecare.

# 3. Creează schema și populează datele demo
npm run db:setup

# 4. Pornește aplicația
npm run dev
```

Aplicația rulează pe [http://localhost:3000](http://localhost:3000).

### Conturi demo

| Rol   | Email             | Parolă   |
| ----- | ----------------- | -------- |
| ADMIN | admin@depozit.ro  | admin123 |
| STAFF | staff@depozit.ro  | staff123 |

Panoul de administrare: [http://localhost:3000/admin](http://localhost:3000/admin)

Seed-ul include 8 categorii, ~20 de produse reale (ciment, rigips, OSB, BCA, izolații etc.) și
8 cereri demo cu statusuri diferite, ca dashboardul să fie populat din prima.

## Variabile de mediu

| Variabilă             | Descriere                                                              |
| --------------------- | ---------------------------------------------------------------------- |
| `TURSO_DATABASE_URL`  | URL-ul bazei Turso (`libsql://...`). Gol = fișier local `local.db`.    |
| `TURSO_AUTH_TOKEN`    | Token de autentificare Turso (necesar doar cu Turso remote).           |
| `AUTH_SECRET`         | Secret pentru semnarea sesiunilor (`openssl rand -base64 32`).         |
| `NEXT_PUBLIC_APP_URL` | URL-ul public al aplicației (folosit în metadata).                     |

## Deploy pe Vercel + Turso

1. **Creează baza Turso:**
   ```bash
   turso db create depozit-construct
   turso db show depozit-construct --url        # -> TURSO_DATABASE_URL
   turso db tokens create depozit-construct     # -> TURSO_AUTH_TOKEN
   ```
2. **Aplică schema și seed-ul pe baza remote:**
   ```bash
   TURSO_DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... npm run db:setup
   ```
3. **Importă proiectul în Vercel** și setează cele 4 variabile de mediu
   (`TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`).
4. **Deploy.** Aplicația e gata — clienții pot instala PWA-ul de pe telefon
   („Adaugă pe ecranul principal").

> **Important pentru producție:** schimbă parolele conturilor demo (sau modifică
> `src/db/seed.ts` înainte de seed) și folosește un `AUTH_SECRET` puternic.

## Scripturi

| Comandă            | Descriere                                       |
| ------------------ | ----------------------------------------------- |
| `npm run dev`      | Server de dezvoltare                            |
| `npm run build`    | Build de producție                              |
| `npm run start`    | Server de producție                             |
| `npm run db:push`  | Aplică schema Drizzle pe baza de date           |
| `npm run db:seed`  | Populează datele demo                           |
| `npm run db:setup` | Schema + seed într-un singur pas                |
| `npm run icons`    | Regenerează iconurile PWA (fără dependențe native) |

## Structura proiectului

```
src/
├── app/
│   ├── (public)/            # Landing, catalog, cerere ofertă, confirmare
│   ├── admin/
│   │   ├── login/           # Autentificare angajați
│   │   └── (panel)/         # Dashboard, cereri, produse, categorii (protejate)
│   ├── layout.tsx           # Layout rădăcină (fonturi, toaster, SW)
│   └── manifest.ts          # Manifest PWA
├── actions/                 # Server actions (public, auth, admin)
├── components/
│   ├── ui/                  # Button, Input, Badge, Modal, Skeleton, EmptyState
│   ├── public/              # Header, bottom nav, card produs, formular cerere
│   └── admin/               # Navigare admin, status select, notițe, CRUD-uri
├── db/                      # Client libSQL, schemă Drizzle, seed
├── lib/                     # Auth (JWT), validări Zod, utilitare/formatare
├── store/                   # Coșul de cerere (zustand + persist)
└── middleware.ts            # Protecția rutelor /admin
```
