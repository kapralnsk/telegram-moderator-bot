import { Telegram } from "../lib/telegram";

const BOT_TOKEN = process.env.BOT_TOKEN!;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

const tg = new Telegram(BOT_TOKEN);

export default async function handler(req: any, res: any) {
  const VERCEL_ENV = process.env.VERCEL_ENV;
  const VERCEL_URL = process.env.VERCEL_URL;

  if (VERCEL_ENV !== "production") {
    return res.status(200).json({ ok: true, skipped: "not production env" });
  }

  if (!VERCEL_URL) {
    if (ADMIN_CHAT_ID) {
      await tg.sendMessage(+ADMIN_CHAT_ID, "Error: VERCEL_URL missing during webhook setup.");
    }
    return res.status(500).json({ error: "VERCEL_URL missing" });
  }

  const desiredUrl = `https://${VERCEL_URL}/api/webhook`;

  try {
    const info = await tg.getWebhookInfo();

    if (info.result?.url === desiredUrl) {
      return res.status(200).json({ ok: true, unchanged: true });
    }

    const r = await tg.setWebhook(desiredUrl);

    if (!r.ok && ADMIN_CHAT_ID) {
      await tg.sendMessage(+ADMIN_CHAT_ID, `Webhook registration failed: ${JSON.stringify(r)}`);
    }

    return res.status(200).json({ ok: true, updated: true, response: r });
  } catch (err) {
    if (ADMIN_CHAT_ID) {
      await tg.sendMessage(+ADMIN_CHAT_ID, `Webhook setup error: ${String(err)}`);
    }

    return res.status(500).json({ error: String(err) });
  }
}
