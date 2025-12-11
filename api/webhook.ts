import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Telegram } from "../lib/telegram";

const BOT_TOKEN = process.env.BOT_TOKEN!;
const STOP_WORDS = (process.env.STOP_WORDS || "")
  .split(",")
  .map(s => s.trim().toLowerCase());
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

const tg = new Telegram(BOT_TOKEN);

function containsStopword(text: string | undefined, entities: any[] | undefined) {
  if (!text) return false;

  const lower = text.toLowerCase();

  // plain substring
  for (const w of STOP_WORDS) {
    if (w && lower.includes(w)) return true;
  }

  // entity-based
  if (entities) {
    for (const e of entities) {
      if (e.type === "text_mention" && e.user?.username) {
        const username = "@" + e.user.username.toLowerCase();
        if (STOP_WORDS.includes(username)) return true;
      }
    }
  }

  return false;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const msg = req.body?.message;
  if (!msg) return res.status(200).end();

  const text = msg.text || msg.caption;
  const entities = msg.entities || msg.caption_entities;

  try {
    if (containsStopword(text, entities)) {
      await tg.deleteMessage(msg.chat.id, msg.message_id);

      if (ADMIN_CHAT_ID) {
        await tg.sendMessage(+ADMIN_CHAT_ID, `Deleted: "${text}"`);
      }
    }
  } catch (err) {
    if (ADMIN_CHAT_ID) {
      await tg.sendMessage(+ADMIN_CHAT_ID, `Error deleting message: ${String(err)}`);
    }
  }

  res.status(200).end();
}
