# 🤖 Ashlynn Telegram Bot (Cloudflare Worker)

This is a Cloudflare Worker-based Telegram bot that supports multiple AI models.

## 🚀 Features
- Supports multiple AI models
- Uses Cloudflare Workers for fast execution
- Stores user preferences in Cloudflare D1 database

## 🔧 Setup

### 1️⃣ Clone the repository
```bash
git clone https://github.com/Itz-Ashlynn/AdvanceGPT-BOT-CF.git
cd ashlynn-bot
```

2️⃣ Install Wrangler CLI (Cloudflare CLI tool)
```bash
npm install -g wrangler
```

3️⃣ Set up Cloudflare authentication
```bash
wrangler login
```

4️⃣ Configure wrangler.toml
Replace your-cloudflare-account-id and your-database-id in wrangler.toml.

5️⃣ Deploy the worker
```bash
wrangler deploy
```

6️⃣ Set up Cloudflare D1
```bash
wrangler d1 execute ashlynn_repo --file=./db/schema.sql
```

7️⃣ Test your bot
Send /start to your bot on Telegram and verify it works!

