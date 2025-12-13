import { telegramApiCall } from "../lib/telegram";

const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;
const TARGET_INLINE_BOT_USERNAME = process.env.TARGET_INLINE_BOT_USERNAME;

if (!WEBHOOK_SECRET) {
  throw new Error("TELEGRAM_WEBHOOK_SECRET is not set");
}

if (!TARGET_INLINE_BOT_USERNAME) {
  throw new Error("TARGET_INLINE_BOT_USERNAME is not set");
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const incomingSecret =
    req.headers["x-telegram-bot-api-secret-token"];

  if (incomingSecret !== WEBHOOK_SECRET) {
    return res.status(401).end();
  }

  const update = req.body;
  const message = update?.message;

  if (!message) {
    return res.status(200).end();
  }

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

  return res.status(200).end();
}
