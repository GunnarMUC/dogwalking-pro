# 🚀 Quick Start Guide

## Aktuelle Status

✅ **Die App läuft bereits!**

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001
- **Backend Health Check**: http://localhost:3001/api/health

## 🔑 Demo-Zugänge

### Admin (Dogwalker)
- **E-Mail**: `admin@dogwalking.com`
- **Passwort**: `admin123`
- **Funktionen**: Vollzugriff auf alle Admin-Features

### Besitzer (Hundebesitzer)
- **E-Mail**: `owner@example.com`
- **Passwort**: `owner123`
- **Funktionen**: Eigene Hunde und Walks ansehen, Profil bearbeiten

## 📱 App testen

1. **Browser öffnen**: http://localhost:5173
2. **Mit Admin-Account anmelden**
3. **Dashboard erkunden**:
   - Hunde verwalten
   - Walks planen
   - Einladungen verschicken
   - Abrechnungen erstellen

## 🛠 Entwicklung

### Server stoppen
```bash
# Alle laufenden Prozesse finden
lsof -ti:3001,5173 | xargs kill -9
```

### Server neu starten
```bash
npm run dev
```

### Datenbank zurücksetzen
```bash
cd backend
rm prisma/dev.db
npx prisma migrate dev
npx prisma db seed
```

### Prisma Studio öffnen (Datenbank-GUI)
```bash
cd backend
npx prisma studio
# Öffnet http://localhost:5555
```

## 📝 Wichtige Commands

```bash
# Development
npm run dev              # Beide Server starten
npm run dev:frontend     # Nur Frontend
npm run dev:backend      # Nur Backend

# Build
npm run build            # Beide Projekte bauen
npm run build:frontend   # Nur Frontend
npm run build:backend    # Nur Backend

# Database
npm run prisma:generate  # Prisma Client generieren
npm run prisma:migrate   # Neue Migration
npm run prisma:studio    # Datenbank-GUI
```

## 🎯 Nächste Schritte

1. **App testen**: Melde dich mit den Demo-Accounts an
2. **Features ausprobieren**: 
   - Als Admin: Neuen Hund anlegen
   - Als Admin: Walk planen
   - Als Admin: Einladung verschicken
   - Als Besitzer: Walk-Historie ansehen
3. **Deployment vorbereiten**: Siehe README.md für Deployment-Optionen

## 🐛 Troubleshooting

### Port bereits belegt
```bash
# Port 3001 freigeben
lsof -ti:3001 | xargs kill -9

# Port 5173 freigeben
lsof -ti:5173 | xargs kill -9
```

### Datenbank-Fehler
```bash
cd backend
rm prisma/dev.db
npx prisma migrate dev
npx prisma db seed
```

### Dependencies neu installieren
```bash
rm -rf node_modules frontend/node_modules backend/node_modules shared/node_modules
rm package-lock.json
npm install
```

## 📦 Projektstruktur

```
dogwalking-app-01/
├── frontend/          # React PWA (Port 5173)
├── backend/           # Express API (Port 3001)
├── shared/            # TypeScript Types
└── README.md          # Vollständige Dokumentation
```

## 🎨 Design

Die App verwendet ein weiches Pastell-Farbschema:
- **Primary (Lila)**: #E0BBE4
- **Secondary (Rosa)**: #FFDFD3
- **Accent (Hellblau)**: #B4E1FF
- **Success (Mint)**: #C9F4AA

## ✅ Phase 1 - Fertiggestellt

Alle Features der Phase 1 sind implementiert und funktionsfähig:

- [x] Monorepo-Struktur
- [x] Backend mit Express + Prisma + SQLite
- [x] Frontend mit React + TypeScript + Tailwind
- [x] JWT Authentifizierung
- [x] Admin-Dashboard
- [x] Hundeverwaltung
- [x] Walk-Management mit Kalender
- [x] Einladungssystem
- [x] Besitzer-Bereich
- [x] Abrechnungssystem
- [x] PWA-Features
- [x] Responsive Design

## 🚀 Deployment Ready

Die App ist bereit für Deployment auf:
- Vercel (Frontend)
- Railway (Backend)
- Render (Full Stack)
- Eigener VPS

Siehe README.md für detaillierte Deployment-Anweisungen.

---

**Happy Coding! 🐕** 

