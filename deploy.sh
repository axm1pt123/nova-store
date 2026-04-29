#!/bin/bash
# ══════════════════════════════════════════════════
#  NOVA Store — Script de deploy a producción
#  Uso: bash deploy.sh
# ══════════════════════════════════════════════════
set -e

echo "🚀 Iniciando deploy de NOVA Store..."

# ── 1. Verificar archivos .env ──────────────────────────────
if [ ! -f "backend/.env" ]; then
  echo "❌ No existe backend/.env — copiá backend/.env.production.example y completá los valores"
  exit 1
fi
if [ ! -f "frontend/.env.local" ]; then
  echo "❌ No existe frontend/.env.local — copiá frontend/.env.production.example y completá los valores"
  exit 1
fi

# ── 2. Verificar JWT_SECRET ─────────────────────────────────
if grep -q "REEMPLAZA_CON_CLAVE" backend/.env 2>/dev/null; then
  echo "❌ JWT_SECRET no fue configurado en backend/.env"
  echo "   Generá una clave con: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\""
  exit 1
fi

echo "✅ Archivos .env encontrados"

# ── 3. Build backend ────────────────────────────────────────
echo "📦 Compilando backend..."
cd backend
npm ci --legacy-peer-deps
npx prisma generate
npm run build
echo "✅ Backend compilado"
cd ..

# ── 4. Build frontend ───────────────────────────────────────
echo "📦 Compilando frontend..."
cd frontend
npm ci --legacy-peer-deps
npm run build
echo "✅ Frontend compilado"
cd ..

# ── 5. Migraciones de base de datos ─────────────────────────
echo "🗄️  Aplicando migraciones..."
cd backend
NODE_ENV=production npx prisma migrate deploy
echo "✅ Base de datos actualizada"
cd ..

echo ""
echo "══════════════════════════════════════════════════"
echo "  ✅ NOVA Store listo para producción"
echo "══════════════════════════════════════════════════"
echo ""
echo "Para iniciar con PM2:"
echo "  cd backend && pm2 start ecosystem.config.js --env production"
echo ""
echo "Para iniciar con Docker:"
echo "  docker-compose -f docker-compose.prod.yml up -d"
echo ""
echo "Verificá que nginx esté configurado con tu dominio."
