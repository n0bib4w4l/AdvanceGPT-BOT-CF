# 🤖 LLM Telegram Bot (Cloudflare Worker)

This is a Cloudflare Worker-based Telegram bot that supports multiple AI models.

## 🚀 Features
- Supports multiple AI models
- Uses Cloudflare Workers for fast execution
- Stores user preferences in Cloudflare D1 database

## 🔧 Setup

### 1️⃣ Clone the repository
```bash
git clone https://github.com/Itz-Ashlynn/AdvanceGPT-BOT-CF.git
cd AdvanceGPT-BOT-CF
```

2️⃣ Install Wrangler CLI (Cloudflare CLI tool)
```bash
npm install -g wrangler
```

3️⃣ Set up Cloudflare authentication
```bash
wrangler login
```

4️⃣ Create a Cloudflare D1 Database
Run the following command to create a new D1 database:

```bash
wrangler d1 create ashlynn_repo
```

After creation, copy the database ID from the output.

5️⃣ Configure wrangler.toml
Open wrangler.toml and update these values:
```bash
name = "ashlynn-bot"
main = "worker/worker.js" 
type = "javascript"
account_id = "your-cloudflare-account-id"
workers_dev = true
compatibility_date = "2024-02-10"

[vars]
BOT_TOKEN = "your-bot-token"

[[d1_databases]]
binding = "chat"
database_name = "ashlynn_repo"
database_id = "your-database-id"
```
🔹 Replace your-cloudflare-account-id and your-database-id with your real values.

6️⃣ Bind the D1 Database
Run this command to confirm the database binding:
```bash
wrangler d1 list
```
You should see ashlynn_repo listed.

7️⃣ Initialize the D1 Database
Create the users table by running:
```bash
wrangler d1 execute ashlynn_repo --file=./db/schema.sql
```

8️⃣ Deploy the Worker
Now, deploy your bot with:
```bash
wrangler deploy
```

9️⃣ Register the Webhook
To enable webhook-based communication, register your bot's webhook with Telegram:
```bash
curl -X POST "https://api.telegram.org/bot(BOT_TOKEN)/setWebhook?url=WORKER_URL"
```

🔹 Replace <BOT_TOKEN> with your actual bot token.

🔹 Replace <WORKER_URL> with the URL of your deployed Cloudflare Worker (e.g., https://ashlynn-bot.yourworkers.dev).

After registering the webhook, the bot will start receiving updates instantly.

🔟 Test Your Bot
Send /start to your bot on Telegram and ensure it responds correctly.


## Credits
Made by [Ashlynn Repository](https://t.me/Ashlynn_Repository) 💜

If you find this project useful, please consider giving it a ⭐ on GitHub!
Your support helps improve and maintain this repository. Forking the repo is also encouraged – feel free to customize and enhance the code to fit your own needs. 🚀



