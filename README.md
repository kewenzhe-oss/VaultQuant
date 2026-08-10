# 🛡️ VaultQuant — Local-First AI Trading Journal & Campaign Intelligence Terminal

[![QuantBrew Ecosystem](https://img.shields.io/badge/Ecosystem-QuantBrew-000000?style=for-the-badge&logo=react&logoColor=white)](https://quantbrews.win/#/landing)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Next.js 15](https://img.shields.io/badge/Framework-Next.js%2015-black?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![Database: SQLite](https://img.shields.io/badge/Database-SQLite%20Local--First-blueviolet?style=for-the-badge&logo=sqlite)](https://www.sqlite.org/)

**VaultQuant** is an open-source, local-first trading journal and quantitative campaign intelligence platform built for active traders and quant developers. It eliminates noisy execution fills by automatically clustering scale-in orders into clean **VWAP Trade Campaigns**, auditing trading discipline with **Multi-Model AI**, and ensuring 100% financial privacy via an embedded local SQLite database.

---

## 🤖 One-Command Autonomous AI Agent & Local Setup

Deploy and launch VaultQuant locally with a single terminal command (ideal for AI Coding Agents like Claude, Gemini, Cursor, Antigravity, or terminal execution):

```bash
git clone https://github.com/postsoma-2050/VaultQuant.git && cd VaultQuant && ./scripts/bootstrap.sh
```

---

## 📌 Core Strengths & Key Advantages

### 1. 📊 Broker CSV Sanitizer & Campaign VWAP Clustering Engine
- **Multi-Broker CSV Compatibility**: Direct support for CSV transaction logs from **Futu / Moomoo (富途)**, **Interactive Brokers (IBKR)**, **Webull (微牛)**, **Charles Schwab**, **Robinhood**, and VaultQuant JSON format.
- **Scale-In VWAP Aggregation**: Automatically groups multiple partial buy entries into a single campaign with exact Volume-Weighted Average Price (VWAP) calculation.
- **Scale-Out Matcher**: Matches partial sell exits into clean, completed trade cards with exact realized PnL.
- **Deterministic ID Deduplication**: Prevents duplicate trade creation upon re-importing updated CSVs.

### 2. 🛡️ Ghostfolio-Grade 2-Stage Dry-Run Preview
- **Pre-Import Verification**: Inspect raw transaction counts, sanitized fills, clustered campaigns, entry VWAPs, exit prices, and pre-calculated PnLs in an interactive modal BEFORE committing to the database.
- **Clean Re-sync**: Option to overwrite existing records or merge seamlessly.

### 3. 🤖 Multi-Model AI Strategy & Execution Auditor
- **Configurable LLM Support**: Load your preferred AI model via `.env` (Anthropic **Claude**, Google **Gemini**, **OpenAI GPT-4o**, **DeepSeek**, **Ollama**, **vLLM**, or any custom OpenAI-compatible endpoint).
- **Discipline & Risk Diagnostics**: Audits strategy rule compliance, emotional notes, win-rate expectancy, and position sizing.

### 4. 📅 Performance Heatmaps & Analytics Terminal
- **365-Day Calendar Heatmap**: Visualize daily, monthly, and yearly PnL performance at a glance.
- **Benchmark Comparison**: Track portfolio equity curve vs. S&P 500 benchmark.

### 5. 🔒 100% Local-First & Complete Financial Sovereignty
- All trade records and journals stay strictly on your local machine in an embedded SQLite database (`file:local.db`).
- Zero data selling, zero third-party SaaS tracking.
- Complete export and restore via lossless JSON and RFC 4180 CSV formats.

---

## ⚡ Quick Start (Manual Setup)

### Option A: Local Node.js / Bootstrap Script
```bash
git clone https://github.com/postsoma-2050/VaultQuant.git
cd VaultQuant
./scripts/bootstrap.sh
```

### Option B: Docker Compose (NAS / VPS / Server Deployment)
```bash
git clone https://github.com/postsoma-2050/VaultQuant.git
cd VaultQuant
docker compose up -d
```
The application will be available at [http://localhost:3000](http://localhost:3000), and all trade data will be automatically persisted to `./data/local.db`.

---

## 🔑 Custom AI & Model Configuration (.env)

VaultQuant operates 100% offline using local quantitative rules. To enable AI performance reports, configure your preferred LLM provider in `.env`:

### Anthropic Claude:
```env
AI_API_KEY=your-anthropic-api-key
AI_MODEL=claude-3-7-sonnet-20250219
```

### OpenAI / DeepSeek / Custom Providers:
```env
AI_API_KEY=your-api-key
AI_BASE_URL=https://api.openai.com/v1   # or https://api.deepseek.com/v1, https://openrouter.ai/api/v1
AI_MODEL=gpt-4o                         # or deepseek-chat, qwen2.5
```

### Local Private Models (Ollama / vLLM):
```env
AI_API_KEY=ollama
AI_BASE_URL=http://localhost:11434/v1
AI_MODEL=llama3.3:70b
```

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router & Server Actions)
- **Language**: TypeScript
- **Database**: SQLite (`file:local.db`) with Drizzle ORM
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS & Shadcn UI
- **Animations**: GSAP & ScrollTrigger
- **Parsing & Clustering**: Custom Campaign Engine & Broker CSV Sanitizer

---

## 📄 License

Open-source under the **MIT License**.
