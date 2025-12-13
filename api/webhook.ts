// api/webhook.ts
import { telegramApiCall } from "../lib/telegram";

const SECRET_TOKEN = process.env.TELEGRAM_WEBHOOK_SECRET;
const TARGET_INLINE_BOT_USERNAME = process.env.TARGET_INLINE_BOT_USERNAME;

if (!SECRET_TOKEN) {
  throw new Error("TELEGRAM_WEBHOOK_SECRET is not set");
}

if (!TARGET_INLINE_BOT_USERNAME) {
  throw new Error("TARGET_INLINE_BOT_USERNAME is not set");
}

export default async function handler(req: Request): Promise<Response> {
  // 1. Authenticate request from Telegram
  const incomingSecret = req.headers.get(
    "x-telegram-bot-api-secret-token"
  );

  if (incomingSecret !== SECRET_TOKEN) {
    return new Response("Unauthorized", { status: 401 });
  }

  // 2. Parse Telegram update
  const update = await req.json();
  const message = update?.message;

  if (!message) {
    return new Response("OK");
  }

  // 3. Detect messages sent via inline bot
  const viaBotUsername = message.via_bot?.username;

  if (
    typeof viaBotUsername === "string" &&
    viaBotUsername.toLowerCase() ===
      TARGET_INLINE_BOT_USERNAME.toLowerCase()
  ) {
    await telegramApiCall("deleteMessage", {
      chat_id: message.chat.id,
      message_id: message.message_id,
    });
  }

  return new Response("OK");
}
