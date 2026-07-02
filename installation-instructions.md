# DogWalking Community App — Installationsanleitung

Vollständige Schritt-für-Schritt-Anleitung für Entwicklung, Konfiguration und Deployment.

---

## Inhaltsverzeichnis

1. [Hardware-Anforderungen](#1-hardware-anforderungen)
2. [Software-Anforderungen](#2-software-anforderungen)
3. [Entwicklungsumgebung installieren](#3-entwicklungsumgebung-installieren)
4. [Projekt einrichten](#4-projekt-einrichten)
5. [Konfiguration](#5-konfiguration)
6. [Datenbank einrichten](#6-datenbank-einrichten)
7. [App starten](#7-app-starten)
8. [Produktions-Build & Deployment](#8-produktions-build--deployment)
9. [Betrieb & Wartung](#9-betrieb--wartung)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Hardware-Anforderungen

### Entwicklung (lokal)

| Komponente | Minimum | Empfohlen |
|------------|---------|-----------|
| **CPU** | 2 Kerne, 2 GHz | 4 Kerne, 2.5+ GHz |
| **RAM** | 4 GB | 8 GB |
| **Festplatte** | 2 GB frei | 5 GB SSD |
| **Netzwerk** | Internet (npm-Registry) | Breitband |

### Produktion (Server)

#### Kleine Praxis (1–3 Dogwalker, bis 50 Hunde)

| Komponente | Anforderung |
|------------|-------------|
| **CPU** | 2 vCPUs |
| **RAM** | 2 GB |
| **Festplatte** | 20 GB SSD |
| **Bandbreite** | 10 Mbit/s |
| **System** | Ubuntu 22.04 LTS, Debian 12, oder vergleichbar |

#### Mittlere Praxis (3–10 Dogwalker, bis 200 Hunde)

| Komponente | Anforderung |
|------------|-------------|
| **CPU** | 4 vCPUs |
| **RAM** | 4 GB |
| **Festplatte** | 40 GB SSD |
| **Bandbreite** | 25 Mbit/s |
| **System** | Ubuntu 22.04 LTS, Debian 12 |

#### Große Praxis (10+ Dogwalker, 200+ Hunde)

| Komponente | Anforderung |
|------------|-------------|
| **CPU** | 6–8 vCPUs |
| **RAM** | 8 GB |
| **Festplatte** | 80 GB SSD |
| **Bandbreite** | 50 Mbit/s |
| **Datenbank** | PostgreSQL (statt SQLite) |
| **System** | Ubuntu 22.04 LTS |

> **Hinweis:** SQLite reicht für kleine bis mittlere Praxen aus und hält die Infrastruktur einfach. Für große Installationen wird PostgreSQL empfohlen (Datenbankschema ist migrationskompatibel).

### Client-Geräte (Endnutzer)

| Plattform | Anforderung |
|-----------|-------------|
| **Desktop** | Jeder moderne Browser: Chrome 90+, Firefox 90+, Safari 15+, Edge 90+ |
| **iOS** | iOS 15+ (Safari), App installierbar via PWA |
| **Android** | Android 10+ (Chrome), App installierbar via PWA |
| **Bildschirm** | 320px Breite (Mobile) bis 1920px (Desktop) — voll responsiv |

---

## 2. Software-Anforderungen

### Entwicklung

| Software | Version | Zweck | Installationsbefehl |
|----------|---------|-------|---------------------|
| **Node.js** | 18.x oder 22.x | JavaScript-Laufzeitumgebung | [nodejs.org](https://nodejs.org) oder `nvm install 22` |
| **npm** | 10.x | Paketmanager (mit Node.js enthalten) | im Lieferumfang von Node.js |
| **Git** | 2.30+ | Versionskontrolle | `apt install git` / `brew install git` |
| **SQLite** | 3.35+ | Datenbank (lokal) | im Lieferumfang der meisten Betriebssysteme |
| **Prisma CLI** | 5.8+ | Datenbank-Migrationen | via `npx prisma` (im Projekt enthalten) |

### Produktion

| Software | Version | Zweck |
|----------|---------|-------|
| **Node.js** | 18.x oder 22.x LTS | App-Server |
| **npm** | 10.x | Build-Ausführung |
| **Nginx** | 1.18+ | Reverse Proxy (empfohlen) |
| **PM2** | 5.x | Prozess-Manager (empfohlen) |
| **Certbot** | 2.x | SSL/TLS-Zertifikate (empfohlen) |
| **SQLite** | 3.35+ | Datenbank (oder PostgreSQL 15+) |

### Optional

| Software | Zweck |
|----------|-------|
| **nvm** (Node Version Manager) | Node.js-Versionen verwalten |
| **PostgreSQL 15+** | Produktionsdatenbank für große Installationen |
| **Docker** | Containerisiertes Deployment |
| **Visual Studio Code** | Empfohlene IDE |
| **TablePlus / DBeaver** | Datenbank-GUI zum Browsen |

---

## 3. Entwicklungsumgebung installieren

### 3.1 Node.js installieren

#### macOS

```bash
# Mit Homebrew
brew install node@22

# Oder mit nvm (empfohlen für Versionswechsel)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
nvm install 22
nvm use 22
```

#### Ubuntu / Debian

```bash
# NodeSource Repository hinzufügen
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Versionen prüfen
node --version   # sollte v22.x.x zeigen
npm --version    # sollte 10.x.x zeigen
```

#### Windows

1. Lade den Installer von [nodejs.org](https://nodejs.org) (LTS-Version 22.x)
2. Führe den Installer aus (alle Standardoptionen akzeptieren)
3. Starte die Eingabeaufforderung neu
4. Prüfe: `node --version` und `npm --version`

### 3.2 Git installieren

```bash
# macOS
brew install git

# Ubuntu/Debian
sudo apt-get install git

# Windows
# Download von https://git-scm.com/download/win
```

### 3.3 Projekt klonen

```bash
git clone https://github.com/GunnarMUC/dogwalking-app-01.git
cd dogwalking-app-01
```

---

## 4. Projekt einrichten

### 4.1 Abhängigkeiten installieren

```bash
# Im Projekt-Root-Verzeichnis
npm install
```

Dies installiert alle Abhängigkeiten für Frontend, Backend und Shared-Types via npm Workspaces.

> **Dauer:** 1–3 Minuten (je nach Internetverbindung). Prisma-Binaries und argon2 werden automatisch für dein Betriebssystem kompiliert.

### 4.2 Projektstruktur prüfen

Nach erfolgreicher Installation sollte die Struktur so aussehen:

```
dogwalking-app-01/
├── frontend/
│   └── node_modules/       ← React, Vite, Tailwind, etc.
├── backend/
│   └── node_modules/       ← Express, Prisma, Argon2, etc.
├── shared/
│   └── src/types.ts
├── node_modules/           ← concurrently (Root)
├── package.json
├── LICENSE
└── README.md
```

---

## 5. Konfiguration

### 5.1 Backend-Umgebungsvariablen

Kopiere die Beispiel-Konfiguration und passe sie an:

```bash
cp backend/.env.example backend/.env
```

Öffne `backend/.env` und setze folgende Werte:

```env
# Datenbank (SQLite für Entwicklung, PostgreSQL-URL für Produktion)
DATABASE_URL="file:./prisma/dev.db"

# JWT Secret — MINDESTENS 32 zufällige Zeichen!
# Generiere eines mit: openssl rand -base64 32
JWT_SECRET="change-this-to-a-secure-random-string-in-production"

# Server-Port (Standard: 4001)
PORT=4001

# Umgebung (development | production | test)
NODE_ENV=development

# Frontend-URL (für CORS)
FRONTEND_URL="http://localhost:5173"
```

#### JWT-Secret generieren

```bash
# Linux/macOS
openssl rand -base64 32

# Alternativ in Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

> **⚠️ Wichtig:** Das JWT-Secret MUSS in Produktion geändert werden. Der Fallback-Wert führt zu einer Warnung beim Start.

### 5.2 Frontend-Umgebungsvariablen

Erstelle `frontend/.env` (falls nicht vorhanden):

```env
# Backend-API-URL (relativ im Dev-Mode, absolut in Produktion)
VITE_API_URL=http://localhost:4001/api
```

> Der Vite-Dev-Server proxyt `/api`-Anfragen automatisch an das Backend (siehe `vite.config.ts`).

### 5.3 Konfiguration validieren

Die App validiert beim Start automatisch:
- `DATABASE_URL` — muss gesetzt sein
- `JWT_SECRET` — muss gesetzt sein und nicht dem Fallback-Wert entsprechen
- `FRONTEND_URL` — muss gesetzt sein

Fehlende Variablen führen zu einem sofortigen Abbruch mit klarer Fehlermeldung.

---

## 6. Datenbank einrichten

### 6.1 Prisma Client generieren

```bash
cd backend
npx prisma generate
```

Dies erzeugt den TypeScript-Client für den Zugriff auf die Datenbank.

### 6.2 Migration ausführen (neue Datenbank)

```bash
# Erste Migration — erstellt alle Tabellen
npx prisma migrate dev --name init
```

Falls du bereits eine bestehende Datenbank hast und die neuen Tabellen (WalkerProfile, RecurringWalkPlan) hinzufügen möchtest:

```bash
npx prisma migrate dev --name add_walker_profile_and_recurring
```

### 6.3 Demo-Daten laden (Seed)

```bash
npx prisma db seed
```

Dies erstellt:
- **1 Admin-Account:** `admin@dogwalking.com` / `admin123`
- **1 Besitzer-Account:** `owner@example.com` / `owner123`
- **2 Hunde:** Max (Golden Retriever) und Bella (Labrador)
- **3 Walks:** 1 abgeschlossen, 2 geplant
- **1 Walker-Profil** für den Admin
- **2 Wiederkehrende Walk-Pläne**
- **Honorarsätze:** 25,00 €/Std für Max, 22,50 €/Std für Bella

### 6.4 Datenbank visuell inspizieren

```bash
# Vom backend-Ordner aus
npx prisma studio
```

Öffnet eine Browser-Oberfläche unter `http://localhost:5555` zum Browsen und Bearbeiten aller Tabellen.

### 6.5 Datenbank zurücksetzen

```bash
# Achtung: löscht alle Daten!
npx prisma migrate reset
```

---

## 7. App starten

### 7.1 Entwicklung (Hot Reload)

```bash
# Vom Root-Verzeichnis aus — startet Backend + Frontend parallel
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:4001
- **API Health:** http://localhost:4001/api/health
- **Prisma Studio:** `npm run prisma:studio` (separater Terminal)

### 7.2 Einzeln starten

```bash
# Nur Backend
npm run dev:backend

# Nur Frontend
npm run dev:frontend
```

### 7.3 Erster Login

1. Öffne http://localhost:5173 im Browser
2. Login mit **Admin-Account:** `admin@dogwalking.com` / `admin123`
3. Du landest auf dem Admin-Dashboard mit Statistiken

---

## 8. Produktions-Build & Deployment

### 8.1 Build erstellen

```bash
# Vom Root-Verzeichnis — baut alles in Reihenfolge
npm run build
```

Erzeugt:
- `frontend/dist/` — statische Dateien (HTML, JS, CSS, Assets)
- `backend/dist/` — kompilierter TypeScript-Code
- `shared/dist/` — kompilierte Shared-Types

### 8.2 Deployment-Optionen

#### Option A: Vercel (Frontend) + Railway (Backend) — ca. 0–25 €/Monat

**Frontend auf Vercel:**
1. Repository auf GitHub pushen
2. Bei [vercel.com](https://vercel.com) mit GitHub anmelden
3. Projekt importieren
4. Build-Einstellungen:
   - **Framework:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Umgebungsvariable setzen:
   - `VITE_API_URL` = `https://dein-backend.railway.app/api`

**Backend auf Railway:**
1. Bei [railway.app](https://railway.app) mit GitHub anmelden
2. Neues Projekt → "Deploy from GitHub repo"
3. Root Directory: `backend`
4. Start Command: `node dist/server.js`
5. Umgebungsvariablen setzen (siehe `.env.example`)
6. Railway stellt automatisch eine URL bereit

#### Option B: VPS (DigitalOcean/Hetzner) — ca. 5–15 €/Monat

```bash
# 1. Server mieten und einrichten
ssh root@deine-server-ip

# 2. System aktualisieren
sudo apt update && sudo apt upgrade -y

# 3. Node.js installieren
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs nginx

# 4. Projekt klonen
git clone https://github.com/GunnarMUC/dogwalking-app-01.git
cd dogwalking-app-01

# 5. Abhängigkeiten installieren und bauen
npm install
npm run build

# 6. Backend starten (mit PM2 für Prozess-Management)
npm install -g pm2
cd backend
pm2 start dist/server.js --name dogwalking-backend
pm2 save
pm2 startup   # Auto-Start bei Server-Neustart

# 7. Nginx als Reverse Proxy
sudo nano /etc/nginx/sites-available/dogwalking
```

Nginx-Konfiguration (`/etc/nginx/sites-available/dogwalking`):

```nginx
server {
    listen 80;
    server_name deine-domain.de;

    # Frontend (statische Dateien)
    root /pfad/zu/dogwalking-app-01/frontend/dist;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    # API zum Backend weiterleiten
    location /api/ {
        proxy_pass http://localhost:4001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Gzip-Komprimierung
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
}
```

```bash
# Nginx aktivieren
sudo ln -s /etc/nginx/sites-available/dogwalking /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# SSL mit Let's Encrypt (kostenlos)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d deine-domain.de
```

#### Option C: Docker — ca. 5–25 €/Monat

```dockerfile
# Dockerfile (im Root-Verzeichnis erstellen)
FROM node:22-alpine

WORKDIR /app
COPY . .
RUN npm install && npm run build

WORKDIR /app/backend
EXPOSE 4001
CMD ["node", "dist/server.js"]
```

```bash
docker build -t dogwalking-app .
docker run -d -p 4001:4001 \
  -e DATABASE_URL="file:./prisma/prod.db" \
  -e JWT_SECRET="dein-sicheres-secret" \
  -e NODE_ENV=production \
  -e FRONTEND_URL="https://deine-domain.de" \
  -v $(pwd)/backend/prisma:/app/backend/prisma \
  --name dogwalking dogwalking-app
```

### 8.3 Produktions-Checkliste

Vor dem Go-Live sicherstellen:

- [ ] `JWT_SECRET` auf zufälligen Wert geändert (min. 32 Zeichen)
- [ ] `NODE_ENV=production` gesetzt
- [ ] `FRONTEND_URL` auf tatsächliche Domain gesetzt
- [ ] `DATABASE_URL` auf Produktions-DB (SQLite-Datei oder PostgreSQL)
- [ ] SSL/TLS-Zertifikat installiert (Let's Encrypt)
- [ ] CORS nur für eigene Domain erlaubt
- [ ] Helmet CSP für Produktion aktiviert (in `server.ts` konfigurieren)
- [ ] Rate Limiting-Werte geprüft (Standard: 200 req/15min global)
- [ ] PM2 oder systemd für Auto-Restart konfiguriert
- [ ] Datenbank-Backup eingerichtet (täglich, z.B. cronjob)
- [ ] Logging konfiguriert (PM2 logs oder externer Dienst)
- [ ] Firewall eingerichtet (nur Ports 80/443 offen)
- [ ] Admin-Passwort nach erstem Login geändert

---

## 9. Betrieb & Wartung

### 9.1 Backup-Strategie

#### SQLite (einfachster Weg)

```bash
# Tägliches Backup via cron
0 3 * * * cp /pfad/zu/backend/prisma/prod.db /backup/dogwalking-$(date +\%Y\%m\%d).db
```

#### PostgreSQL

```bash
# pg_dump
0 3 * * * pg_dump -U dogwalking dogwalking_prod > /backup/dogwalking-$(date +\%Y\%m\%d).sql
```

### 9.2 Monitoring

- **PM2 Monitoring:** `pm2 monit` (Live-Metriken)
- **Health-Endpoint:** `GET /api/health` (kann mit UptimeRobot gepingt werden)
- **Logs:** `pm2 logs dogwalking-backend`

### 9.3 Updates einspielen

```bash
cd dogwalking-app-01
git pull origin main
npm install          # Neue Abhängigkeiten
npm run build        # Neu bauen
cd backend
npx prisma migrate deploy  # Neue Migrationen anwenden
pm2 restart dogwalking-backend
```

### 9.4 Log-Rotation

PM2 konfiguriert automatisch Log-Rotation. Zusätzlich kann `logrotate` verwendet werden:

```bash
# /etc/logrotate.d/dogwalking
/root/.pm2/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
}
```

---

## 10. Troubleshooting

### Problem: `npm install` schlägt fehl mit argon2-Fehler

```bash
# Build-Tools installieren und erneut versuchen
# Ubuntu/Debian:
sudo apt install build-essential python3

# macOS:
xcode-select --install

# Dann erneut:
npm install
```

### Problem: Prisma-Client nicht gefunden

```bash
cd backend
npx prisma generate
```

### Problem: `EADDRINUSE` — Port bereits belegt

```bash
# Prüfen, welcher Prozess Port 4001 nutzt
lsof -i :4001

# Anderen Port in backend/.env setzen:
PORT=4002
```

### Problem: CORS-Fehler im Frontend

Sicherstellen, dass in `backend/.env` die korrekte Frontend-URL steht:

```env
FRONTEND_URL="http://localhost:5173"   # Dev
FRONTEND_URL="https://deine-domain.de" # Produktion
```

### Problem: Login funktioniert, aber Cookies werden nicht gespeichert

- Prüfe, ob der Browser Third-Party-Cookies blockiert
- In Produktion muss `secure: true` im Cookie gesetzt sein → erfordert HTTPS
- Für lokale Entwicklung: `secure: false` in `auth.ts` (Standard)

### Problem: Datenbank lässt sich nicht migrieren

```bash
# Datenbank komplett zurücksetzen (Daten gehen verloren!)
npx prisma migrate reset

# Falls das nicht hilft:
rm -rf backend/prisma/migrations
npx prisma migrate dev --name init
npx prisma db seed
```

### Problem: Pages zeigen nur eine weiße Seite

1. Browser-DevTools öffnen (F12)
2. Console-Tab prüfen — dort erscheinen JavaScript-Fehler
3. Network-Tab prüfen — schlagen API-Calls fehl?
4. Ist das Backend erreichbar? `curl http://localhost:4001/api/health`

### Problem: npm Workspaces funktionieren nicht

```bash
# npm-Cache leeren und neu installieren
rm -rf node_modules frontend/node_modules backend/node_modules shared/node_modules
npm cache clean --force
npm install
```

### Support-Kontakt

- **GitHub Issues:** https://github.com/GunnarMUC/dogwalking-app-01/issues
- **E-Mail:** über das GitHub-Profil

---

## Anhang: Schnellreferenz

### Häufigste Befehle

| Befehl | Was er tut |
|--------|-----------|
| `npm install` | Alle Abhängigkeiten installieren |
| `npm run dev` | Backend + Frontend im Dev-Mode starten |
| `npm run build` | Produktions-Build erstellen |
| `npm run prisma:studio` | Datenbank visuell browsen |
| `cd backend && npx prisma migrate dev --name init` | Datenbank-Migration ausführen |
| `cd backend && npx prisma db seed` | Demo-Daten laden |
| `cd backend && npx prisma migrate reset` | Datenbank komplett zurücksetzen |

### Ports

| Dienst | Port | URL |
|--------|------|-----|
| Frontend (Dev) | 5173 | http://localhost:5173 |
| Backend (API) | 4001 | http://localhost:4001 |
| Prisma Studio | 5555 | http://localhost:5555 |
| Health Check | 4001 | http://localhost:4001/api/health |

### Dateien und Pfade

| Was | Wo |
|-----|-----|
| Backend `.env` | `backend/.env` |
| Frontend `.env` | `frontend/.env` |
| Prisma Schema | `backend/prisma/schema.prisma` |
| Seed-Daten | `backend/prisma/seed.ts` |
| Datenbank-Datei | `backend/prisma/dev.db` (SQLite) |
| Frontend Build | `frontend/dist/` |
| Backend Build | `backend/dist/` |
| Typdefinitionen | `shared/src/types.ts` |
