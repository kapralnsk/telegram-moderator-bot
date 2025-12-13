// lib/telegram.ts

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!BOT_TOKEN) {
  throw new Error("TELEGRAM_BOT_TOKEN is not set");
}

const TELEGRAM_API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

export async function telegramApiCall<T = any>(
  method: string,
  payload: Record<string, unknown>
): Promise<T> {
  const res = await fetch(`${TELEGRAM_API_BASE}/${method}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!data.ok) {
    console.error("Telegram API error", {
      method,
      payload,
      response: data,
    });
    throw new Error(`Telegram API error: ${data.description}`);
  }

  return data.result;
}
