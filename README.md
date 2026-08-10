# 🛡️ VaultQuant — Local-First AI Trading Journal & Quantitative Terminal

[![QuantBrew Ecosystem](https://img.shields.io/badge/Ecosystem-QuantBrew-000000?style=for-the-badge&logo=react&logoColor=white)](https://quantbrews.win/#/landing)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Next.js 15](https://img.shields.io/badge/Framework-Next.js%2015-black?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![Database: SQLite](https://img.shields.io/badge/Database-SQLite%20Local--First-blueviolet?style=for-the-badge&logo=sqlite)](https://www.sqlite.org/)

**VaultQuant** is an open-source, local-first trading journal and quantitative risk terminal built for serious traders and quant developers. It guarantees complete data sovereignty by storing all trade records locally in SQLite (`file:local.db`), pairing rule-based quantitative engines with AI-driven risk reasoning.

---

## 📌 Why VaultQuant?

For quantitative analysis and post-trade review, trading data represents your most sensitive financial privacy. **VaultQuant** is designed from the ground up as a **Local-First** trading journal and AI analytics system.

Without uploading sensitive trade logs to third-party SaaS platforms, all your data remains strictly on your local machine in an embedded SQLite database (`file:local.db`). Combined with local rule engines and optional LLM integration, you retain 100% control over your data.

---

## 🚀 Core Features

### 1. 🛡️ Live Exposure & Risk Checklist
- **Real-Time Risk Diagnosis**: Automatically evaluates open positions for severe floating losses (e.g., drawdown > 20%), portfolio-level drawdowns, and single-asset concentration risks.
- **Directional Style Alignment**: Compares open position bias (e.g., 100% Long) against historical win rate data to prevent emotional or off-plan entries.

### 2. 📋 Trading Strategies & Discipline Score (%)
- **Pre-Flight Checklists**: Define mandatory Open and Close rules for your custom trading strategies (e.g., Breakout, Trend Following).
- **Discipline Rating**: Tracks compliance for every trade and calculates an automated Discipline Score (%) to enforce execution rigor.

### 3. 📊 Financial-Grade Analytics Terminal
- **Full-Bleed Responsive Canvas**: High-density table layout with partial close tracking, hold duration analytics, and exact ROI percentage calculations.
- **Account Equity Tracking**: Real-time equity tracking with benchmark comparison vs. the S&P 500 index.

### 4. 🧠 Trade AI & Interactive Follow-up Chat
- **Multi-Dimensional Reports**: Generates structured performance analysis on Money Management, Instruments, and Time Management.
- **Interactive Follow-up Q&A**: Ask follow-up questions directly on AI reports with seamless keyboard shortcuts (`Enter` to submit, `Shift+Enter` for new lines).

---

## 🔗 Ecosystem Integration: QuantBrew

**VaultQuant** is a core local terminal in the **[QuantBrew Ecosystem](https://quantbrews.win/#/landing)**, built to seamlessly complement quantitative backtesting, live risk tracking, and strategy review workflows.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router & Server Actions)
- **Language**: TypeScript
- **Database**: SQLite (`file:local.db`) with Drizzle ORM
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS & Shadcn UI (Clean Light Minimalist Theme)
- **Validation**: Zod & React Hook Form
- **AI Integration**: Anthropic Claude API / OpenAI-Compatible endpoints (with offline fallback)

---

## ⚡ Quick Start

### 1. Clone Repository & Install Dependencies

```bash
git clone https://github.com/postsoma-2050/VaultQuant.git
cd VaultQuant
npm install --legacy-peer-deps
```

### 2. Initialize Local Database (`file:local.db`)

```bash
npm run db:generate
npm run db:migrate
```

### 3. Start Local Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or `http://localhost:3001`) in your browser.

---

## 🔑 Custom AI & Model Configuration (URL, Token, Model)

VaultQuant operates **100% offline out-of-the-box** using local quantitative rule engines. 

To enable advanced AI reasoning reports and interactive follow-up Q&A, VaultQuant allows you to load **any custom AI model, provider, or local LLM engine** (Anthropic, OpenAI, DeepSeek, OpenRouter, Ollama, vLLM, etc.) by configuring custom environment variables in a `.env` file at the root of the project:

### Option A: Standard Anthropic Setup
```env
AI_API_KEY=your-anthropic-api-key
AI_MODEL=claude-3-7-sonnet-20250219
```

### Option B: Custom OpenAI / DeepSeek / Provider Setup
```env
# 1. Custom API Token / Key
AI_API_KEY=your-api-key

# 2. Custom Provider Endpoint (Base URL)
AI_BASE_URL=https://api.openai.com/v1   # or https://api.deepseek.com/v1, https://openrouter.ai/api/v1

# 3. Custom Model Identifier
AI_MODEL=gpt-4o                         # or deepseek-chat, qwen2.5, etc.
```

### Option C: Local Private LLM Setup (Ollama / vLLM)
Keep your trading data 100% private by connecting VaultQuant to a self-hosted local model:
```env
AI_API_KEY=ollama
AI_BASE_URL=http://localhost:11434/v1
AI_MODEL=llama3.3:70b
```

---

## 📄 License

This project is open-source under the **MIT License**.

