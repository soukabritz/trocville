# TrocVille

Application mobile de troc d'objets entre particuliers (remise en main propre uniquement), avec API REST securisee en Node.js/Express, PostgreSQL, et orchestration Docker Compose.

## 1) Choix techniques

- **Back-end**: Node.js + Express (architecture MVC + couche service)
- **Base principale**: PostgreSQL (coherent pour relation users/items/trade_offers/messages)
- **Base secondaire optionnelle**: MongoDB (pre-configuree dans Docker Compose pour logs/notifications)
- **Front mobile**: React Native avec Expo Go (non dockerise)
- **Infra**: Docker + Docker Compose pour API + PostgreSQL (+ Mongo optionnel)

## 2) Arborescence complete

```txt
.
+-- backend
¦   +-- .env
¦   +-- .env.example
¦   +-- .gitignore
¦   +-- Dockerfile
¦   +-- jest.config.js
¦   +-- package.json
¦   +-- src
¦   ¦   +-- app.js
¦   ¦   +-- server.js
¦   ¦   +-- config
¦   ¦   ¦   +-- db.js
¦   ¦   ¦   +-- env.js
¦   ¦   +-- controllers
¦   ¦   ¦   +-- auth.controller.js
¦   ¦   ¦   +-- item.controller.js
¦   ¦   ¦   +-- message.controller.js
¦   ¦   ¦   +-- tradeOffer.controller.js
¦   ¦   ¦   +-- user.controller.js
¦   ¦   +-- database
¦   ¦   ¦   +-- migrations
¦   ¦   ¦   ¦   +-- 001_init.sql
¦   ¦   ¦   +-- seeds
¦   ¦   ¦       +-- seed.js
¦   ¦   +-- middlewares
¦   ¦   ¦   +-- auth.middleware.js
¦   ¦   ¦   +-- error.middleware.js
¦   ¦   ¦   +-- validate.middleware.js
¦   ¦   +-- models
¦   ¦   ¦   +-- category.model.js
¦   ¦   ¦   +-- item.model.js
¦   ¦   ¦   +-- message.model.js
¦   ¦   ¦   +-- tradeOffer.model.js
¦   ¦   ¦   +-- user.model.js
¦   ¦   +-- routes
¦   ¦   ¦   +-- auth.routes.js
¦   ¦   ¦   +-- item.routes.js
¦   ¦   ¦   +-- message.routes.js
¦   ¦   ¦   +-- tradeOffer.routes.js
¦   ¦   ¦   +-- user.routes.js
¦   ¦   +-- services
¦   ¦   ¦   +-- auth.service.js
¦   ¦   ¦   +-- item.service.js
¦   ¦   ¦   +-- message.service.js
¦   ¦   ¦   +-- tradeOffer.service.js
¦   ¦   ¦   +-- user.service.js
¦   ¦   +-- utils
¦   ¦       +-- AppError.js
¦   +-- tests
¦       +-- health.test.js
+-- docker-compose.yml
+-- mobile
    +-- App.js
    +-- app.json
    +-- package.json
    +-- assets
    +-- src
        +-- components
        ¦   +-- EmptyState.js
        +-- context
        ¦   +-- AuthContext.js
        +-- navigation
        ¦   +-- MainTabNavigator.js
        ¦   +-- RootNavigator.js
        +-- screens
        ¦   +-- auth
        ¦   ¦   +-- LoginScreen.js
        ¦   ¦   +-- RegisterScreen.js
        ¦   +-- home
        ¦   ¦   +-- HomeScreen.js
        ¦   +-- items
        ¦   ¦   +-- ItemsScreen.js
        ¦   +-- messages
        ¦   ¦   +-- MessagesScreen.js
        ¦   +-- profile
        ¦   ¦   +-- ProfileScreen.js
        ¦   +-- trades
        ¦       +-- TradesScreen.js
        +-- services
            +-- api.js
            +-- apiClient.js
```

## 3) Schema PostgreSQL

Le schema est dans `backend/src/database/migrations/001_init.sql`.

Tables:
- `users`
- `categories`
- `items`
- `trade_offers`
- `messages`

Points importants:
- contraintes `CHECK` sur les statuts et etats (`condition_state`, `status`)
- cles etrangeres pour garantir l'integrite
- indexes sur les colonnes de filtre (`city`, `category_id`) et conversation
- categories initialisees automatiquement

## 4) Endpoints REST principaux

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### User
- `GET /api/users/me` (JWT)
- `PUT /api/users/me` (JWT)

### Items
- `GET /api/items`
- `GET /api/items/:id`
- `POST /api/items` (JWT)
- `PUT /api/items/:id` (JWT + proprietaire)
- `DELETE /api/items/:id` (JWT + proprietaire)

Filtres disponibles sur `GET /api/items`:
- `categoryId`
- `conditionState`
- `cities` (CSV, ex: `?cities=Paris,Lyon`)

### Trade offers
- `POST /api/trade-offers` (JWT)
- `PATCH /api/trade-offers/:id/status` (JWT, statut: `accepted|refused|completed`)

### Messages
- `GET /api/messages/trade-offer/:tradeOfferId` (JWT)
- `POST /api/messages` (JWT)

### Health
- `GET /health`

## 5) Ce qui a ete fait et pourquoi (pas a pas)

### Etape A - Initialisation structure
**Action**: creation des dossiers backend/mobile selon architecture demandee.

**Pourquoi**:
- separer clairement le domaine mobile et le domaine API
- respecter MVC cote backend
- garantir une base maintenable pour l'examen

### Etape B - Base backend Express
**Action**:
- `app.js` + `server.js`
- config env (`env.js`) + connexion PostgreSQL (`db.js`)
- middlewares globaux (CORS, JSON, logs HTTP)
- gestion propre des erreurs (`AppError`, `error.middleware`)

**Pourquoi**:
- demarrage propre et standard pro
- separer configuration, bootstrap et logique metier

### Etape C - Couche MVC + Service
**Action**:
- `routes` pour la declaration des endpoints
- `controllers` pour gerer req/res
- `services` pour la logique metier
- `models` pour acces SQL

**Pourquoi**:
- responsabilites claires
- code testable et lisible
- evite de mettre toute la logique dans les routes

### Etape D - Securite
**Action**:
- hash mot de passe avec `bcrypt`
- JWT (`auth.middleware`) pour routes protegees
- validation des inputs avec `express-validator`
- verification proprietaire sur update/delete d'annonce

**Pourquoi**:
- respecter exigences de securite
- limiter erreurs et abus

### Etape E - Modele relationnel SQL
**Action**:
- schema SQL complet dans `001_init.sql`
- contraintes metier (enum-like via CHECK)
- indexes sur colonnes de recherche

**Pourquoi**:
- assurer coherence des donnees
- accelerer filtres annonces

### Etape F - Dockerisation backend + BDD
**Action**:
- `backend/Dockerfile`
- `docker-compose.yml` (backend + postgres + mongo optionnel)

**Pourquoi**:
- environnement reproductible
- lancement simple pour demo jury

### Etape G - Structure Expo mobile
**Action**:
- navigation stack + tabs
- ecrans vides par domaine
- `AuthContext`
- client API de base

**Pourquoi**:
- preparer un front evolutif sans melanger la logique
- permettre implementation ecran par ecran

### Etape H - Test de base
**Action**:
- test `GET /health` avec `jest` + `supertest`

**Pourquoi**:
- prouver un premier niveau de qualite et de non-regression

## 6) Commandes terminal (environnement de travail)

## Pre-requis
- Node.js 20+
- npm 10+
- Docker Desktop

## Lancer backend + PostgreSQL avec Docker
Depuis la racine du projet:

```bash
docker compose up --build
```

API disponible sur:
- `http://localhost:4000`

## Lancer mobile Expo (hors Docker)
Dans un autre terminal:

```bash
cd mobile
npm install
npm run start
```

Puis ouvrir avec Expo Go (QR code).

## Lancer backend en local (sans Docker)

```bash
cd backend
npm install
# copier .env.example vers .env et adapter DATABASE_URL
npm run dev
```

## Tests backend

```bash
cd backend
npm test
```

## 7) Variables d'environnement backend

Voir `backend/.env.example`:
- `NODE_ENV`
- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`

## 8) Ordre de dev conseille (pour ne pas se perdre)

1. Auth
2. Users
3. Items
4. Trade offers
5. Messages
6. Filtres avances
7. Logs MongoDB

## 9) Prochaines etapes recommandees

- ajouter tests metier demandes (inscription, login, creation annonce, filtres ville, troc, messages)
- brancher les formulaires React Native aux endpoints
- ajouter gestion images (upload S3/Cloudinary ou stockage local en dev)
- ajouter pagination sur `GET /api/items`
- ajouter logs MongoDB (actions: register, login, create_item, create_offer, send_message)
