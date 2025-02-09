const BOT_TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${BOT_TOKEN}/`;
const API_TIMEOUT = 50000;  
const CHANNEL_USERNAME = '@Ashlynn_Repository';
const VALID_MODELS = [
  "claude-3-haiku",
  "gpt-4o",
  "qwen-2-72b",
  "deepseek-r1",
  "phi-4",
  "gemini-1.5-flash",
  "mixtral-8x7b"
]; 

export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response('Invalid request', { status: 405 });
    }
    
    const update = await request.json();
    if (!update.message) {
      return new Response('No message found', { status: 400 });
    }
    
    const chatId = update.message.chat.id;
    const text = update.message.text?.trim() || '';
    const userId = update.message.from.id.toString();

    // 🚀 Check if the user is a member before doing anything else
    const userModel = await getUserModel(env.chat, userId) || 'phi-4';
    
    try {
      if (text === '/start') {
        await sendMessageWithButton(chatId, `<b>👋 Welcome to ChatGPT Bot!</b>\n\nUse <code>/set</code> to choose your AI model, <code>/help</code> for commands, and start chatting!`);
      } else if (text === '/help') {
        await sendMessageWithButton(chatId, `<b>📜 Available Commands:</b>\n<code>/start</code> - Welcome message\n<code>/help</code> - List available commands\n<code>/about</code> - Information about this bot\n<code>/set [model]</code> - Change AI model`);
      } else if (text === '/about') {
        await sendMessageWithButton(chatId, `<b>🤖 ChatGPT Bot</b> using model: <code>${userModel}</code>\n🌐 Powered by AI`);
      } else if (text === '/set') {
        await sendMessage(chatId, `❌ <b>Please choose a model from the following:</b>\n\n${VALID_MODELS.map(m => `<code>${m}</code>`).join('\n')}\n\nCopy any model and send <code>/set [model]</code> to change it.`);
      } else if (text.startsWith('/set ')) {
        const model = text.split('/set ')[1].trim();
        if (!VALID_MODELS.includes(model)) {
          await sendMessage(chatId, `❌ <b>Invalid model.</b> Choose one from:\n\n${VALID_MODELS.map(m => `<code>${m}</code>`).join('\n')}\n\nCopy any model and send <code>/set [model]</code> to change it.`);
        } else {
          await saveUserModel(env.chat, userId, model);
          await sendMessageWithButton(chatId, `✅ <b>Model successfully set to:</b> <code>${model}</code>`);
        }
      } else {
        const tempMessage = await sendMessage(chatId, `🤖 <i>Thinking... Your question is being processed using model:</i> <code>${userModel}</code>`);
        try {
          const response = await getChatResponse(userModel, text, userId);
          await editMessage(chatId, tempMessage.result.message_id, response);
        } catch (error) {
          await editMessage(chatId, tempMessage.result.message_id, `⚠️ <b>Error:</b> ${error.message || 'Failed to fetch response'}`);
        }
      }
    } catch (error) {
      await sendMessageWithButton(chatId, `❌ <b>Unexpected Error:</b> ${error.message || 'Something went wrong!'}`);
    }
    
    return new Response('OK', { status: 200 });
  }
}; 

async function getChatResponse(model, question, userId) {
  const url = `https://ashlynn.freewebhostmost.com/AR-API.php?question=${encodeURIComponent(question)}&id=${userId}&model=${model}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    // Check if the response is OK (status in the range 200-299)
    if (!response.ok) {
      const errorText = await response.text(); // Read the response as text for logging
      console.error(`HTTP error! Status: ${response.status}, Response: ${errorText}`);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Check if the response is JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text(); // Read the response as text
      console.error(`Unexpected response format: ${text}`);
      throw new Error(`Unexpected response format: ${text}`);
    }

    const data = await response.json();
    if (data.successful !== 'success') {
      console.error(`API Error: ${JSON.stringify(data)}`);
      throw new Error('API Error: Failed to fetch response');
    }
    return data.response;
  } catch (error) {
    clearTimeout(timeout);
    console.error(`Error occurred: ${error.message}`);
    throw new Error(error.message || 'Request timed out');
  }
}

async function sendMessage(chatId, text) {
  return fetch(TELEGRAM_API_URL + 'sendMessage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' })
  }).then(res => res.json());
}

async function sendMessageWithButton(chatId, text) {
  return fetch(TELEGRAM_API_URL + 'sendMessage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [[{ text: '🔗 Join Us', url: 'https://t.me/Ashlynn_Repository' }]]
      }
    })
  }).then(res => res.json());
}

async function editMessage(chatId, messageId, newText) {
  return fetch(TELEGRAM_API_URL + 'editMessageText', {
    method: 'POST',  
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, message_id: messageId, text: newText })
  }).then(res => res.json());
}

async function getUserModel(db, userId) {
  const { results } = await db.prepare("SELECT model FROM users WHERE id = ?").bind(userId).all();
  return results.length ? results[0].model : null;
}

async function saveUserModel(db, userId, model) {
  await db.prepare("INSERT INTO users (id, model) VALUES (?, ?) ON CONFLICT (id) DO UPDATE SET model = ?")
    .bind(userId, model, model).run();
}

// ✅ Fixed function names and syntax
async function checkUserMembership(userId) {
  try {
    const url = `${TELEGRAM_API_URL}getChatMember?chat_id=${CHANNEL_USERNAME}&user_id=${userId}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) }); 
    const data = await response.json();
    return data.ok && ['member', 'administrator', 'creator'].includes(data.result.status);
  } catch (error) {
    console.error('Membership check error:', error);
    return false;
  }
}

async function sendJoinMessage(chatId) {
  return fetch(TELEGRAM_API_URL + 'sendMessage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: `🚨 <b>You must join our channel before using this bot!</b>\n\n🔗 <a href="https://t.me/Ashlynn_Repository">Join Now</a> and then try again.`,
      reply_markup: { inline_keyboard: [[{ text: '🔗 Join Channel', url: 'https://t.me/Ashlynn_Repository' }]] }
    })
  }).then(res => res.json());
}

// SQL to create the users table in Cloudflare D1
// Run this command in your Cloudflare Workers D1 database setup:
// CREATE TABLE users (id TEXT PRIMARY KEY, model TEXT NOT NULL);
