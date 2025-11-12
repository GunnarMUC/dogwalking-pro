# Dogwalking Community App - Phase 1 MVP

Eine moderne Progressive Web App (PWA) für professionelle Dogwalker zur Verwaltung von Hunden, Walks, Kunden und Abrechnungen.

## 🚀 Features

### Admin-Funktionen (Dogwalker)
- **Dashboard**: Übersicht über Hunde, Besitzer und anstehende Walks
- **Hundeverwaltung**: Anlegen und Bearbeiten von Hundeprofilen mit medizinischen Notizen
- **Walk-Management**: Kalenderansicht, Walk-Planung, Anwesenheitsliste, Start/Stop-Funktion
- **Besitzerverwaltung**: Übersicht aller registrierten Hundebesitzer
- **Einladungssystem**: Einladen neuer Besitzer via Token-Link
- **Abrechnung**: Honorarsätze konfigurieren, Stundenübersicht, CSV-Export

### Besitzer-Funktionen
- **Dashboard**: Übersicht eigener Hunde und Walks
- **Walk-Historie**: Detaillierte Ansicht aller Walks
- **Profilverwaltung**: Bearbeitung persönlicher Daten
- **Datenschutz**: DSGVO-konforme Datenverarbeitung

### Technische Features
- ✅ Progressive Web App (PWA) - installierbar auf Mobilgeräten
- ✅ Responsive Design - optimiert für Mobile und Desktop
- ✅ JWT-basierte Authentifizierung
- ✅ Rollenbasierte Zugriffskontrolle (Admin/Owner)
- ✅ Offline-fähig (Service Worker)
- ✅ Moderne UI mit Pastell-Farbschema

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Routing**: TanStack Router
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **UI Components**: Lucide React Icons
- **Date Handling**: date-fns
- **Notifications**: react-hot-toast
- **PWA**: vite-plugin-pwa

### Backend
- **Runtime**: Node.js 22
- **Framework**: Express + TypeScript
- **Database**: SQLite mit Prisma ORM
- **Authentication**: JWT + bcrypt
- **CORS**: cors middleware
- **Environment**: dotenv

### Monorepo
- npm workspaces
- Shared TypeScript types
- Concurrent dev servers

## 📋 Voraussetzungen

- Node.js 22.x oder höher
- npm 10.x oder höher
- Git

## 🚀 Installation & Entwicklung

### 1. Repository klonen

\`\`\`bash
git clone <repository-url>
cd dogwalking-app-01
\`\`\`

### 2. Dependencies installieren

\`\`\`bash
npm install
\`\`\`

### 3. Datenbank initialisieren

\`\`\`bash
cd backend
npx prisma migrate dev
npx prisma db seed
\`\`\`

### 4. Development Server starten

\`\`\`bash
# Im Root-Verzeichnis (startet Frontend & Backend gleichzeitig)
npm run dev
\`\`\`

Die App ist nun erreichbar unter:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001
- **Prisma Studio**: `npm run prisma:studio` (im backend-Ordner)

### Demo-Zugänge

Nach dem Seeding sind folgende Test-Accounts verfügbar:

**Admin (Dogwalker)**
- E-Mail: `admin@dogwalking.com`
- Passwort: `admin123`

**Besitzer**
- E-Mail: `owner@example.com`
- Passwort: `owner123`

## 📁 Projektstruktur

\`\`\`
dogwalking-app-01/
├── frontend/                 # React PWA
│   ├── src/
│   │   ├── components/      # Wiederverwendbare Komponenten
│   │   ├── pages/           # Seiten (admin/ und owner/)
│   │   ├── store/           # Zustand State Management
│   │   ├── lib/             # API Client
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/              # Statische Assets
│   └── package.json
│
├── backend/                  # Express API
│   ├── src/
│   │   ├── routes/          # API Endpoints
│   │   ├── middleware/      # Auth & Validation
│   │   ├── lib/             # Prisma, JWT
│   │   └── server.ts
│   ├── prisma/
│   │   ├── schema.prisma    # Datenbankschema
│   │   └── seed.ts          # Demo-Daten
│   └── package.json
│
├── shared/                   # Geteilte TypeScript Types
│   ├── src/
│   │   └── types.ts
│   └── package.json
│
└── package.json              # Root workspace
\`\`\`

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registrierung (nur mit Token)
- `GET /api/auth/me` - Aktueller User
- `POST /api/auth/logout` - Logout

### Invitations (Admin)
- `GET /api/invitations` - Liste aller Einladungen
- `POST /api/invitations` - Neue Einladung
- `DELETE /api/invitations/:id` - Einladung löschen
- `GET /api/invitations/validate/:token` - Token validieren

### Users
- `GET /api/users` - Alle Benutzer (Admin)
- `GET /api/users/:id` - Benutzer Details
- `PATCH /api/users/:id` - Benutzer aktualisieren
- `DELETE /api/users/:id` - Benutzer löschen (Admin)

### Dogs
- `GET /api/dogs` - Alle Hunde
- `GET /api/dogs/:id` - Hund Details
- `POST /api/dogs` - Hund erstellen (Admin)
- `PATCH /api/dogs/:id` - Hund aktualisieren (Admin)
- `DELETE /api/dogs/:id` - Hund löschen (Admin)

### Walks
- `GET /api/walks` - Alle Walks
- `GET /api/walks/:id` - Walk Details
- `POST /api/walks` - Walk erstellen (Admin)
- `PATCH /api/walks/:id` - Walk aktualisieren (Admin)
- `POST /api/walks/:id/start` - Walk starten (Admin)
- `POST /api/walks/:id/end` - Walk beenden (Admin)
- `PATCH /api/walks/:walkId/attendance/:dogId` - Anwesenheit aktualisieren (Admin)
- `DELETE /api/walks/:id` - Walk löschen (Admin)

### Rates (Admin)
- `GET /api/rates` - Alle Honorarsätze
- `POST /api/rates` - Honorarsatz erstellen
- `PATCH /api/rates/:id` - Honorarsatz aktualisieren
- `DELETE /api/rates/:id` - Honorarsatz löschen

### Billing (Admin)
- `POST /api/billing/report` - Abrechnungsbericht
- `POST /api/billing/export/csv` - CSV-Export

## 🏗 Build & Deployment

### Production Build

\`\`\`bash
# Im Root-Verzeichnis
npm run build
\`\`\`

Dies erstellt:
- `frontend/dist/` - Statische Frontend-Dateien
- `backend/dist/` - Kompiliertes Backend

### Deployment-Optionen

#### Option 1: Vercel (Frontend) + Railway (Backend)

**Frontend (Vercel):**
1. Repository auf GitHub pushen
2. Auf Vercel importieren
3. Build Settings:
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Environment Variables:
   - `VITE_API_URL`: URL des Backend-Servers

**Backend (Railway):**
1. Railway Projekt erstellen
2. GitHub Repository verbinden
3. Root Directory: `backend`
4. Start Command: `npm start`
5. Environment Variables setzen (siehe `.env.example`)

#### Option 2: Render (Full Stack)

1. Zwei Services erstellen:
   - **Web Service** (Frontend)
   - **Web Service** (Backend)
2. Environment Variables konfigurieren
3. Auto-Deploy aktivieren

#### Option 3: VPS (DigitalOcean, Hetzner, etc.)

\`\`\`bash
# Server-Setup
sudo apt update
sudo apt install nodejs npm nginx

# App deployen
git clone <repository>
cd dogwalking-app-01
npm install
npm run build

# Nginx als Reverse Proxy konfigurieren
# PM2 für Backend-Prozess-Management
npm install -g pm2
cd backend
pm2 start dist/server.js --name dogwalking-backend
\`\`\`

### Umgebungsvariablen

**Backend (.env):**
\`\`\`env
DATABASE_URL="file:./prisma/dev.db"  # Oder PostgreSQL in Production
JWT_SECRET="your-secure-secret-key"
PORT=3001
NODE_ENV=production
FRONTEND_URL="https://your-frontend-url.com"
\`\`\`

**Frontend (.env):**
\`\`\`env
VITE_API_URL=https://your-backend-url.com/api
\`\`\`

## 🔒 Sicherheit

- ✅ JWT-basierte Authentifizierung mit httpOnly Cookies
- ✅ Passwörter mit bcrypt gehashed
- ✅ CORS-Konfiguration
- ✅ Rollenbasierte Zugriffskontrolle
- ✅ Input-Validierung
- ✅ DSGVO-konforme Datenverarbeitung

## 📱 PWA Installation

Die App kann auf Mobilgeräten installiert werden:

**iOS:**
1. Safari öffnen
2. Teilen-Button → "Zum Home-Bildschirm"

**Android:**
1. Chrome öffnen
2. Menü → "App installieren"

## 🧪 Testing

\`\`\`bash
# Backend testen
cd backend
npm test

# Frontend testen
cd frontend
npm test
\`\`\`

## 📝 Lizenz

Privates Projekt - Alle Rechte vorbehalten

## 🤝 Support

Bei Fragen oder Problemen:
- Issue auf GitHub erstellen
- E-Mail an: support@dogwalking-app.com

## 🎨 Design-System

**Farben:**
- Primary (Lila): `#E0BBE4`
- Secondary (Rosa): `#FFDFD3`
- Accent (Hellblau): `#B4E1FF`
- Success (Mint): `#C9F4AA`
- Text: `#4A4A4A`

**Schriftart:** Inter (Google Fonts)

## 🔄 Weitere Entwicklung (Phase 2 & 3)

Geplante Features für zukünftige Versionen:
- 📍 Echtzeit-GPS-Tracking
- 📸 Foto-Upload während Walks
- 💬 Community-Features (Chat, Walk-Tausch)
- 🔔 Push-Benachrichtigungen
- 🌍 Mehrsprachigkeit (DE/EN)
- 🔁 Wiederkehrende Walk-Pläne
- 💳 Zahlungsintegration (Stripe)

## ✅ Phase 1 - Abgeschlossen

- [x] Projekt-Setup & Grundarchitektur
- [x] Datenbank-Design & Backend-Grundlagen
- [x] Authentifizierung & Rollen
- [x] Admin-Dashboard
- [x] Hundeprofile CRUD
- [x] Besitzer-Registrierung & Profil
- [x] Walk-Management
- [x] Basis-Abrechnung
- [x] PWA-Features & Deployment-Vorbereitung

---

**Status**: ✅ Ready for Deployment (Apple App Store vorbereitet als PWA)

Entwickelt mit ❤️ für die Dogwalking-Community

