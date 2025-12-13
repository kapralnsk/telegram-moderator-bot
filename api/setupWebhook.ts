import { Telegram } from "../lib/telegram";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
const SECRET_TOKEN = process.env.TELEGRAM_WEBHOOK_SECRET;
const VERCEL_ENV = process.env.VERCEL_ENV;
const VERCEL_URL = process.env.VERCEL_URL;

if (!BOT_TOKEN || !SECRET_TOKEN) {
  console.error("TELEGRAM_BOT_TOKEN or TELEGRAM_WEBHOOK_SECRET missing");
  process.exit(1);
}

async function main() {
  if (VERCEL_ENV !== "production") {
    console.log("Skipping webhook registration for non-production environment");
    return;
  }

  if (!VERCEL_URL) {
    console.error("VERCEL_URL missing");
    return;
  }

  const tg = new Telegram(BOT_TOKEN);
  const webhookUrl = `https://${VERCEL_URL}/api/webhook`;

  try {
    const info = await tg.getWebhookInfo();

    if (info.result?.url === webhookUrl) {
      console.log("Webhook already set correctly");
      return;
    }

    const res = await tg.setWebhook(webhookUrl, SECRET_TOKEN);
    console.log("Webhook registration response:", res);

    if (!res.ok && ADMIN_CHAT_ID) {
      await tg.sendMessage(+ADMIN_CHAT_ID, `Webhook registration failed: ${JSON.stringify(res)}`);
    }
  } catch (err) {
    console.error("Error registering webhook:", err);
    if (ADMIN_CHAT_ID) {
      await tg.sendMessage(+ADMIN_CHAT_ID, `Webhook setup error: ${String(err)}`);
    }
  }
}

main();
