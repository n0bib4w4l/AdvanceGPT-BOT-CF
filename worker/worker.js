const API_TIMEOUT = 50000;
// Made by https://t.me/Ashlynn_Repository
export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response('Invalid request', { status: 405 });
    }
// Made by https://t.me/Ashlynn_Repository
    const BOT_TOKEN = env.BOT_TOKEN; 
    const TELEGRAM_API_URL = `https://api.telegram.org/bot${BOT_TOKEN}/`;
    const CHANNEL_USERNAME = '@Ashlynn_Repository';
    const VALID_MODELS = [
      "claude-3-haiku",
      "gpt-4o-mini",
      "glm-4",
      "gpt-4o",      
      "dbrx-instruct",
      "deepseek-r1",
      "qwen-2.5-coder-32b",
      "llama-3.3-70b",
      "gemini-1.5-flash",
      "mixtral-8x7b"
    ]; 
// Made by https://t.me/Ashlynn_Repository
    const update = await request.json();
    if (!update.message) {
      return new Response('No message found', { status: 400 });
    }
// Made by https://t.me/Ashlynn_Repository
    const chatId = update.message.chat.id;
    const text = update.message.text?.trim() || '';
    const userId = update.message.from.id.toString();
// Made by https://t.me/Ashlynn_Repository
    const userModel = await getUserModel(env.chat, userId) || 'gpt-4o';
    // Made by https://t.me/Ashlynn_Repository
    try {
      if (text === '/start') {
        await sendMessageWithButton(TELEGRAM_API_URL, chatId, `<b>👋 Welcome to ChatGPT Bot!</b>\n\nUse <code>/set</code> to choose your AI model, <code>/help</code> for commands, and start chatting!`);
      } else if (text === '/help') {
        await sendMessageWithButton(TELEGRAM_API_URL, chatId, `<b>📜 Available Commands:</b>\n<code>/start</code> - Welcome message\n<code>/help</code> - List available commands\n<code>/about</code> - Information about this bot\n<code>/set [model]</code> - Change AI model`);
      } else if (text === '/about') {
        await sendMessageWithButton(TELEGRAM_API_URL, chatId, `<b>🤖 ChatGPT Bot</b> using model: <code>${userModel}</code>\n🌐 Powered by AI`);
      } else if (text === '/set') {
        await sendMessage(TELEGRAM_API_URL, chatId, `❌ <b>Please choose a model from the following:</b>\n\n${VALID_MODELS.map(m => `<code>${m}</code>`).join('\n')}\n\nCopy any model and send <code>/set [model]</code> to change it.`);
      } else if (text.startsWith('/set ')) {
        const model = text.split('/set ')[1].trim();
        if (!VALID_MODELS.includes(model)) {
          await sendMessage(TELEGRAM_API_URL, chatId, `❌ <b>Invalid model.</b> Choose one from:\n\n${VALID_MODELS.map(m => `<code>${m}</code>`).join('\n')}\n\nCopy any model and send <code>/set [model]</code> to change it.`);
        } else {
          await saveUserModel(env.chat, userId, model);
          await sendMessageWithButton(TELEGRAM_API_URL, chatId, `✅ <b>Model successfully set to:</b> <code>${model}</code>`);
        }
      } else {
        const tempMessage = await sendMessage(TELEGRAM_API_URL, chatId, `🤖 <i>Thinking... Your question is being processed using model:</i> <code>${userModel}</code>`);
        try {
          const response = await getChatResponse(userModel, text, userId);
          await editMessage(TELEGRAM_API_URL, chatId, tempMessage.result.message_id, response);
        } catch (error) {
          await editMessage(TELEGRAM_API_URL, chatId, tempMessage.result.message_id, `⚠️ <b>Error:</b> ${error.message || 'Failed to fetch response'}`);
        }
      }
    } catch (error) {
      await sendMessageWithButton(TELEGRAM_API_URL, chatId, `❌ <b>Unexpected Error:</b> ${error.message || 'Something went wrong!'}`);
    }
    // Made by https://t.me/Ashlynn_Repository
    return new Response('OK', { status: 200 });
  }
}; 
// Made by https://t.me/Ashlynn_Repository
async function getChatResponse(model, question, userId) {
  const url = `https://api-y5s2.onrender.com/chat/?question=${encodeURIComponent(question)}&model=${model}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
// Made by https://t.me/Ashlynn_Repository
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP error! Status: ${response.status}, Response: ${errorText}`);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
// Made by https://t.me/Ashlynn_Repository
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error(`Unexpected response format: ${text}`);
      throw new Error(`Unexpected response format: ${text}`);
    }
// Made by https://t.me/Ashlynn_Repository
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
// Made by https://t.me/Ashlynn_Repository
async function sendMessage(TELEGRAM_API_URL, chatId, text) {
  return fetch(TELEGRAM_API_URL + 'sendMessage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' })
  }).then(res => res.json());
}
// Made by https://t.me/Ashlynn_Repository
async function sendMessageWithButton(TELEGRAM_API_URL, chatId, text) {
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
// Made by https://t.me/Ashlynn_Repository
async function editMessage(TELEGRAM_API_URL, chatId, messageId, newText) {
  return fetch(TELEGRAM_API_URL + 'editMessageText', {
    method: 'POST',  
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, message_id: messageId, text: newText })
  }).then(res => res.json());
}
// Made by https://t.me/Ashlynn_Repository
async function getUserModel(db, userId) {
  const { results } = await db.prepare("SELECT model FROM users WHERE id = ?").bind(userId).all();
  return results.length ? results[0].model : null;
}
// Made by https://t.me/Ashlynn_Repository
async function saveUserModel(db, userId, model) {
  await db.prepare("INSERT INTO users (id, model) VALUES (?, ?) ON CONFLICT (id) DO UPDATE SET model = ?")
    .bind(userId, model, model).run();
}
// Made by https://t.me/Ashlynn_Repository
