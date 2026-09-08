# 🚀 Guide de Déploiement Indépendant (Frontend & Backend Séparés) - Scudrop FR

Ce projet est conçu selon une architecture **modulaire découplée**, vous permettant de déployer :
1. **Le Frontend (Client React + Vite)** sur n'importe quel hébergeur statique (**Vercel, Netlify, Cloudflare Pages**).
2. **Le Backend (Serveur Express + Multer + MongoDB/JSON)** sur n'importe quel hébergeur Node.js (**Render, Railway, Fly.io, DigitalOcean, VPS**).
3. Ou les deux ensemble dans un conteneur unique (Cloud Run, Docker).

---

## 📁 1. Structure du Projet

```
├── server/                     # 🖥️ BACKEND STANDALONE
│   ├── app.ts                  # Application Express autonome + CORS
│   ├── index.ts                # Point d'entrée serveur (PORT 5000)
│   ├── db.ts                   # Mongoose (MongoDB) + fallback JSON
│   ├── upload.ts               # Configuration Multer (preuves d'achat)
│   ├── models/                 # Modèles Mongoose (Order, Expense)
│   ├── routes/                 # Routes API (/api/orders, /api/expenses, /api/stats)
│   ├── package.json            # Dépendances isolées du backend
│   └── .env.example            # Variables d'environnement du backend
│
├── src/                        # 💻 FRONTEND STANDALONE
│   ├── config/api.ts           # Client API avec gestion VITE_API_BASE_URL
│   ├── services/api.ts         # Fonctions fetch modulaires
│   ├── components/             # Composants React + Logo Scudrop FR
│   ├── App.tsx                 # Dashboard principal
│   └── main.tsx                # Entrée React
│
├── public/                     # 🎨 ASSETS & LOGOS
│   ├── logo.svg                # Logo officiel Scudrop FR
│   └── favicon.svg             # Favicon
│
├── server.ts                   # Point d'entrée Fullstack unifié (Développement local / Cloud Run)
└── package.json                # Scripts npm globaux
```

---

## 🖥️ 2. Déploiement du Backend (Serveur)

Vous pouvez déployer le backend sur **Render**, **Railway**, **Fly.io**, **Heroku** ou un **VPS Ubuntu/Debian**.

### Option A : Déploiement sur Render.com (Web Service)
1. Créez un nouveau **Web Service** sur [Render.com](https://render.com) en liant votre repo GitHub.
2. Définissez :
   - **Root Directory** : `.` (ou `server` si vous préférez pointer sur le dossier)
   - **Build Command** : `npm install && npm run build:backend`
   - **Start Command** : `npm run start:backend`
3. Ajoutez les **Variables d'Environnement** :
   ```env
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/scudrop?retryWrites=true&w=majority
   CLIENT_URL=https://mon-scudrop-frontend.vercel.app
   ```
4. Cliquez sur **Deploy**. Votre API sera disponible par exemple sur : `https://scudrop-api.onrender.com`.

### Option B : Déploiement sur Railway.app
1. Créez un projet sur [Railway.app](https://railway.app).
2. Ajoutez un service Node.js depuis votre repo GitHub.
3. Définissez la variable `MONGODB_URI` et `CLIENT_URL`.
4. Start command : `npm run start:backend`.

---

## 💻 3. Déploiement du Frontend (Client)

Vous pouvez déployer le frontend sur **Vercel**, **Netlify**, ou **Cloudflare Pages** gratuitement et en quelques secondes.

### Option A : Déploiement sur Vercel
1. Rendez-vous sur [Vercel](https://vercel.com) et importez votre repo GitHub.
2. Configuration de base :
   - **Framework Preset** : `Vite`
   - **Build Command** : `npm run build:frontend`
   - **Output Directory** : `dist`
3. Ajoutez la variable d'environnement essentielle :
   ```env
   VITE_API_BASE_URL=https://scudrop-api.onrender.com
   ```
   *(Remplacez par l'URL de votre backend déployé)*
4. Cliquez sur **Deploy**. Votre dashboard Scudrop FR est en ligne et communique en toute sécurité avec votre backend distant via CORS !

### Option B : Déploiement sur Netlify
1. Sur [Netlify](https://netlify.com), créez un nouveau site depuis Git.
2. Paramètres :
   - **Build command** : `npm run build:frontend`
   - **Publish directory** : `dist`
   - **Environment variable** : `VITE_API_BASE_URL=https://scudrop-api.onrender.com`
3. Pour supporter le routage SPA sur Netlify, un fichier `public/_redirects` contenant `/* /index.html 200` peut être ajouté.

---

## 🛠️ 4. Commandes Locales Disponibles

| Commande | Action |
|---|---|
| `npm run dev` | Lance l'application complète unifiée (Backend + Frontend) sur le port 3000 |
| `npm run dev:backend` | Lance **uniquement le backend** en mode standalone sur le port 5000 |
| `npm run dev:frontend` | Lance **uniquement le frontend** Vite sur le port 5173 |
| `npm run build:frontend` | Compile le frontend React dans `dist/` |
| `npm run build:backend` | Compile le backend Node.js dans `dist/backend.cjs` |
| `npm run start:backend` | Démarre le backend compilé `dist/backend.cjs` |
