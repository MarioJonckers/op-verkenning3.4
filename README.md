# Toets WO – Belgische Gewesten, Provincies & Hoofdplaatsen (React + TS + Vite)

Een eenvoudige leerapp om spelenderwijs de **provincies**, **gewesten** en **hoofdsteden** (hoofplaatsen) van België te oefenen. Gebouwd met React, TypeScript en Vite. Inclusief score-overzicht en Docker build.

---

## ✅ Prerequisites

- **Node.js 22.x** (aanbevolen: de laatste 22.x LTS/Current)
- **npm** (meegeleverd met Node 22)
- Optioneel voor releases: **Docker** + **buildx**

> Tip: gebruik **nvm** om Node-versies te beheren zodat iedereen dezelfde versie draait.

---

## 🧰 nvm installeren

### macOS (Homebrew)
```bash
brew install nvm
mkdir -p ~/.nvm
# Voeg aan je shell-profiel toe (één van deze, afhankelijk van je shell)
# ~/.zshrc of ~/.bashrc of ~/.bash_profile
cat >> ~/.zshrc <<'EOF'
export NVM_DIR="$HOME/.nvm"
[ -s "/opt/homebrew/opt/nvm/nvm.sh" ] && . "/opt/homebrew/opt/nvm/nvm.sh"  # loads nvm
[ -s "/opt/homebrew/opt/nvm/etc/bash_completion.d/nvm" ] && . "/opt/homebrew/opt/nvm/etc/bash_completion.d/nvm"  # loads bash_completion
EOF
source ~/.zshrc
```

> Gebruik je **Intel Mac**, vervang `/opt/homebrew` door `/usr/local`.

### Windows (nvm-windows)
1. Download **nvm-windows** (installer) via GitHub: *coreybutler/nvm-windows* (Releases).
2. Installeer, herstart terminal (PowerShell/Command Prompt).
3. Gebruik `nvm install`/`nvm use` zoals hieronder.

---

## 📦 Node.js 22.x installeren met nvm

```bash
# Installeer de gewenste 22.x, bv. 22.10.0
nvm install 22
# Of specifieker
nvm install 22.10.0
```

### De juiste Node-versie gebruiken
```bash
nvm use 22
# Controleren
node -v   # v22.x.x
npm -v
```

> Optioneel: maak een `.nvmrc` met de exacte versie zodat `nvm use` automatisch pakt.
>
> ```bash
> echo "22" > .nvmrc
> nvm use
> ```

---

## 🚀 Project installeren

```bash
# 1) Dependencies installeren
npm ci
```

> Gebruik **npm ci** i.p.v. `npm install` voor reproduceerbare builds.

### Dev-server starten
```bash
npm run dev
```
- Open: http://localhost:5173

### Productie build maken
```bash
npm run build
```

### Productie build lokaal previewen
```bash
npm run preview
```

---

## 🧪 Node- & tooling-versies (aanbevolen)
- **Node**: 22.x
- **npm**: meegeleverd met Node 22
- **Vite**: 7.x
- **TypeScript**: zoals gedefinieerd in `package.json`

---

## 📦 Release maken (semver) + Docker (optioneel)

### 1) Versie bumpen en taggen
Zorg dat je working tree **clean** is:
```bash
git status
```
Maak een patch/minor/major release met npm (of via de Makefile als aanwezig):
```bash
# Patch (x.y.z -> x.y.(z+1))
npm version patch -m "chore: release %s"
# Minor (x.y.z -> x.(y+1).0)
# npm version minor -m "chore: release %s"
# Major ((x+1).0.0)
# npm version major -m "chore: release %s"

# Push code + tags
git push --follow-tags
```

### 2) Docker image bouwen (multi-arch) en pushen
> Voor TrueNAS/Intel kies minstens `linux/amd64`. Voor Apple Silicon kan je lokaal bouwen, maar publiceer `amd64` voor je NAS.

```bash
# Login bij registry indien nodig
# docker login

# Huidige app-versie ophalen uit package.json
APP_VERSION=$(node -p "require('./package.json').version")
IMAGE="jonckerswillems/belgische-quiz:${APP_VERSION}"

# Multi-arch build (alleen amd64 hieronder)
docker buildx build \
  --platform linux/amd64 \
  -t ${IMAGE} \
  -t jonckerswillems/belgische-quiz:latest \
  --push .
```

Deploy daarna via **Portainer** en publiceer via **NGINX Proxy Manager** (host: je-container:80).

---

## 🧭 Project scripts
Handige scripts uit `package.json`:

```bash
npm run dev       # start Vite dev-server
npm run build     # build naar dist/
npm run preview   # serve dist/ lokaal
```

> Als je een **Makefile** gebruikt voor releases en Docker, dan kun je bv. `make release-patch` en `make docker-push` gebruiken (afhankelijk van jouw Makefile-inhoud).

---

## ❓ Troubleshooting
- **“working directory not clean”** bij `npm version`: commit/stash je wijzigingen of run `git status` en los conflicten op.
- **Port mapping**: container expose’t poort **80** (nginx). Publiceer bv. `5173:80` als je lokaal wil testen.
- **ARM vs Intel**: bouw je image met `--platform linux/amd64` voor TrueNAS (Intel).

---

## 📄 Licentie
Privé/educatief gebruik. Pas aan naar wens.