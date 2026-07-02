# 🐕 DogWalking Community App — Unified Platform

**Professionelle Plattform für Hundebetreuung** — Dogwalker- und Besitzer-Portal mit Walker-Management, Terminverwaltung, Abrechnung und mehr.

> Gebaut als moderne Full-Stack PWA mit React, Express, Prisma und TypeScript.

---

## ✨ Features

### Admin (Dogwalker)
| Bereich | Features |
|---------|----------|
| **Dashboard** | Echtzeit-Statistiken: Hunde, Besitzer, Walker, anstehende/aktive Walks |
| **Hunde** | Vollständiges CRUD, Rasse/Gewicht/Alter, medizinische Notizen, Notfallkontakt, Foto-URL |
| **Walks** | Kalenderansicht, Multi-Hund-Auswahl, Start/Stop-Timer, Anwesenheitstracking, Walk-Notizen |
| **Walker** | Walker-Profile mit Bio, Stundensatz, Einsatzgebieten, Zertifikaten, Bewertungen |
| **Besitzer** | Kundenkartei mit Hund-Übersicht, Einladungssystem via Token-Link |
| **Abrechnung** | Honorarsatz-Verwaltung, Abrechnungsbericht mit MwSt (19%), CSV-Export mit Rechnungsnummern |
| **Wiederkehrend** | Wiederkehrende Walk-Pläne mit Wochentags-Rhythmus |

### Owner (Hundebesitzer)
| Bereich | Features |
|---------|----------|
| **Dashboard** | Eigene Hunde, Walk-Übersicht, anstehende Termine |
| **Profil** | Persönliche Daten, DSGVO-Informationen |
| **Walk-Historie** | Alle Walks mit Status, Dauer, teilnehmenden Hunden |

### Plattform
| Feature | Technologie |
|---------|-------------|
| **Security** | Argon2-Passwort-Hashing, JWT (httpOnly Cookies), Helmet, Rate Limiting |
| **Validation** | Zod-Schemas für alle API-Endpunkte (Server-seitig + Client-seitig) |
| **Architecture** | Service-Layer-Pattern, getrennte Verantwortlichkeiten (Routes → Services → Prisma) |
| **PWA** | Installierbar auf iOS/Android, Offline-fähig via Service Worker |
| **Design** | Responsive, Mobile-First, deutsches UI mit Pastell-Designsystem |

---

## 🛠 Tech Stack

| Layer | Technologie |
|-------|-------------|
| **Frontend** | React 18, TypeScript 5.3, Vite 5, TanStack Router, Zustand, Tailwind CSS 3, Lucide React |
| **Backend** | Node.js 22, Express 4, TypeScript 5.3, Prisma 5.8 (SQLite) |
| **Auth** | Argon2 (Password Hashing) + JWT (jsonwebtoken) |
| **Validation** | Zod 3.22 — Schemas für alle 8 API-Ressourcen |
| **Security** | Helmet 8, express-rate-limit 7, CORS, httpOnly Cookies |
| **Shared Types** | Monorepo mit `@dogwalking/shared` Package |
| **Tooling** | npm Workspaces, concurrently, tsx, Vite PWA Plugin |

---

## 🏗 Architektur

```
frontend/ (React PWA)
    ├── components/    (ProtectedRoute, AdminLayout, OwnerLayout)
    ├── pages/         (admin/Dashboard, Dogs, Walks, Walkers, Billing, Invitations, Users)
    ├── store/         (Zustand authStore)
    ├── lib/           (ApiClient, Utils)
    └── router.tsx     (TanStack Router mit Rollen-Prüfung)

backend/ (Express API)
    ├── routes/        (auth, dogs, walks, walkers, invitations, rates, billing, dashboard, recurring)
    ├── services/      (Auth, Dog, User, Walk, Walker, Billing, Invitation, Rate — Service Layer)
    ├── schemas/       (auth, dog, walk, walker, billing, invitation, common — Zod-Validierung)
    ├── middleware/     (authenticate, requireAdmin, requireOwner)
    ├── lib/           (Prisma Client, JWT)
    ├── config/        (env.ts — Environment-Validierung beim Startup)
    └── server.ts      (Helmet, Rate Limiting, CORS, Error Handler)

shared/
    └── src/types.ts   (Alle TypeScript-Types: User, Dog, WalkerProfile, Walk, Invoice, Dashboard, etc.)
```

---

## 🚀 Schnellstart

### Voraussetzungen
- Node.js 18+ und npm 10+
- Git

```bash
git clone https://github.com/GunnarMUC/dogwalking-pro.git
cd dogwalking-pro

npm install
cd backend
npx prisma migrate dev --name init
npx prisma db seed
cd ..

npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:4001
- **Prisma Studio**: `npm run prisma:studio`

### Demo-Zugänge
| Rolle | E-Mail | Passwort |
|-------|--------|----------|
| Admin | `admin@dogwalking.com` | `admin123` |
| Besitzer | `owner@example.com` | `owner123` |

---

## 🔌 API-Referenz

### Authentication
| Methode | Endpoint | Auth | Beschreibung |
|---------|----------|------|-------------|
| POST | `/api/auth/register` | — | Registrierung mit Einladungstoken |
| POST | `/api/auth/login` | — | Login, setzt httpOnly Cookie |
| GET | `/api/auth/me` | JWT | Aktueller Benutzer |
| POST | `/api/auth/logout` | — | Logout, löscht Cookie |

### Walker (NEU)
| Methode | Endpoint | Auth | Beschreibung |
|---------|----------|------|-------------|
| GET | `/api/walkers` | JWT | Alle Walker-Profile |
| GET | `/api/walkers/search` | JWT | Suche mit Filtern (Gebiet, Preis, Rating) |
| GET | `/api/walkers/:id` | JWT | Walker-Detail |
| POST | `/api/walkers` | Admin | Walker-Profil erstellen |
| PUT | `/api/walkers/:id` | Admin | Walker-Profil aktualisieren |
| DELETE | `/api/walkers/:id` | Admin | Walker-Profil löschen |

### Walks (erweiterter Lifecycle)
| Methode | Endpoint | Auth | Beschreibung |
|---------|----------|------|-------------|
| GET | `/api/walks` | JWT | Alle Walks (mit Datum/Status-Filter) |
| POST | `/api/walks` | Admin | Walk erstellen |
| PATCH | `/api/walks/:id` | Admin | Walk bearbeiten |
| POST | `/api/walks/:id/start` | Admin | Walk starten → IN_PROGRESS |
| POST | `/api/walks/:id/end` | Admin | Walk beenden → COMPLETED |
| POST | `/api/walks/:id/confirm` | Admin | Walk bestätigen |
| POST | `/api/walks/:id/cancel` | Admin | Walk absagen → CANCELLED |
| PATCH | `/api/walks/:walkId/attendance/:dogId` | Admin | Anwesenheit toggeln |
| DELETE | `/api/walks/:id` | Admin | Walk löschen |

### Billing (mit MwSt)
| Methode | Endpoint | Auth | Beschreibung |
|---------|----------|------|-------------|
| POST | `/api/billing/report` | Admin | Abrechnungsbericht (Netto/MwSt/Brutto) |
| POST | `/api/billing/export/csv` | Admin | CSV-Export mit Rechnungsnummern |

### Weitere Endpunkte
| Ressource | Endpoints |
|-----------|-----------|
| **Dogs** | `GET/POST /api/dogs`, `GET/PATCH/DELETE /api/dogs/:id` |
| **Users** | `GET /api/users`, `GET/PATCH/DELETE /api/users/:id` |
| **Invitations** | `GET/POST /api/invitations`, `DELETE /api/invitations/:id`, `GET /api/invitations/validate/:token` |
| **Rates** | `GET/POST /api/rates`, `PATCH/DELETE /api/rates/:id` |
| **Dashboard** | `GET /api/dashboard/stats` |
| **Recurring** | `GET/POST /api/recurring`, `PATCH /api/recurring/:id/toggle`, `DELETE /api/recurring/:id` |
| **Health** | `GET /api/health` |

---

## 🔒 Sicherheit

| Maßnahme | Implementierung |
|----------|----------------|
| Password Hashing | Argon2 (Speicher-hard, resistent gegen GPU/ASIC-Angriffe) |
| Session Management | JWT mit 7-Tage-Gültigkeit, httpOnly Cookies |
| API-Schutz | Helmet (CSP, XSS, etc.) + Rate Limiting (20 req/15min für Auth, 200 req/15min global) |
| Zugriffskontrolle | Rollenbasierte Middleware (ADMIN/OWNER) |
| Input-Validierung | Zod-Schemas für alle Endpunkte |
| CORS | Nur konfigurierte FRONTEND_URL |
| Env-Validierung | Fehlende Variablen werden beim Startup abgefangen |

---

## 📁 Projektstruktur

```
dogwalking-pro/
├── frontend/                 # React PWA
│   ├── src/
│   │   ├── components/      # AdminLayout, OwnerLayout, ProtectedRoute
│   │   ├── pages/admin/     # Dashboard, Dogs, Walks, Walkers, Billing, Invitations, Users
│   │   ├── pages/owner/     # Dashboard, Profile, Walks
│   │   ├── store/           # Zustand Auth Store
│   │   └── lib/             # API Client, Utilities
│   └── package.json
├── backend/                  # Express API
│   ├── src/
│   │   ├── routes/          # 9 Route-Dateien (auth, dogs, walks, walkers, invitations, rates, billing, dashboard, recurring)
│   │   ├── services/        # 8 Service-Dateien (Auth, Dog, User, Walk, Walker, Billing, Invitation, Rate)
│   │   ├── schemas/         # 7 Zod-Schema-Dateien
│   │   ├── middleware/      # Auth-Middleware
│   │   ├── lib/             # Prisma, JWT
│   │   └── config/         # Environment-Validierung
│   ├── prisma/
│   │   ├── schema.prisma    # 8 Modelle (User, Dog, Walk, Attendance, Rate, Invitation, WalkerProfile, RecurringWalkPlan)
│   │   └── seed.ts          # Demo-Daten mit Test-Accounts
│   └── package.json
├── shared/                   # Geteilte TypeScript-Types
│   └── src/types.ts         # 30+ Interfaces & Types
├── LICENSE                   # Apache 2.0
└── package.json              # npm Workspaces Root
```

---

## 🏗 Build & Deployment

```bash
npm run build                    # Build: shared → backend → frontend
npm run build:backend            # Nur Backend
npm run build:frontend           # Nur Frontend
```

### Deployment-Optionen
- **Vercel** (Frontend) + **Railway** (Backend) — einfachste Variante
- **Render** (Full-Stack) — beides in einem
- **VPS** (DigitalOcean/Hetzner) — Nginx + PM2

---

## 📝 Lizenz

Apache License 2.0 — siehe [LICENSE](./LICENSE)

---

## 🔄 Status

| Feature | Status |
|---------|--------|
| Auth (Argon2 + JWT) | ✅ |
| Rollenbasiert (Admin/Owner) | ✅ |
| Dog CRUD | ✅ |
| Walk Management + Kalender | ✅ |
| Walk Booking-Lifecycle | ✅ |
| Walker-Profile + Suche | ✅ |
| Invitation-System | ✅ |
| Billing mit MwSt (19%) | ✅ |
| CSV-Export mit Rechnungsnummern | ✅ |
| Wiederkehrende Walks | ✅ |
| Zod-Validierung (alle Endpunkte) | ✅ |
| Helmet + Rate Limiting | ✅ |
| Env-Validierung beim Startup | ✅ |
| Service-Layer-Architektur | ✅ |
| PWA (Offline-fähig) | ✅ |
| Dashboard-Stats API | ✅ |
| **Testing** | ✅ |
| **Docker** | ✅ |
| **PostgreSQL** | ✅ |
| **Stripe Payments** | 📋 Geplant |

---

## 🤝 Mitwirken

Pull Requests sind willkommen. Bei größeren Änderungen bitte zuerst ein Issue erstellen.

---

Entwickelt mit Fokus auf Datenschutz, Performance und deutsche UX.
