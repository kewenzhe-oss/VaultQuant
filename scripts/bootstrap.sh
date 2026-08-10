#!/usr/bin/env bash

set -e

echo "🚀 Starting VaultQuant Autonomous Local Setup..."

# 1. Install Node dependencies
echo "📦 Installing Node dependencies..."
npm install --legacy-peer-deps

# 2. Generate and run Drizzle SQLite migrations
echo "🗄️ Initializing SQLite Database (local.db)..."
npm run db:generate || true
npm run db:migrate || true

# 3. Launch Development Server
echo "⚡ Launching VaultQuant Development Server at http://localhost:3000..."
npm run dev
