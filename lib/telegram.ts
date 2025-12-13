const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!BOT_TOKEN) {
  throw new Error("TELEGRAM_BOT_TOKEN is not set");
}

const API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

export async function telegramApiCall(
  method: string,
  payload: Record<string, unknown>
) {
  const response = await fetch(`${API_BASE}/${method}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!data.ok) {
    console.error("Telegram API error", {
      method,
      payload,
      response: data,
    });
  }

  return data;
}
