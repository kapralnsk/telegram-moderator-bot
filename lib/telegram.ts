export class Telegram {
  constructor(private token: string) {}

  private base(method: string) {
    return `https://api.telegram.org/bot${this.token}/${method}`;
  }

  async call(method: string, body: unknown) {
    const res = await fetch(this.base(method), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const json = await res.json();
    return json;
  }

  deleteMessage(chatId: number, messageId: number) {
    return this.call("deleteMessage", {
      chat_id: chatId,
      message_id: messageId
    });
  }

  sendMessage(chatId: number, text: string) {
    return this.call("sendMessage", {
      chat_id: chatId,
      text
    });
  }

  getWebhookInfo() {
    return this.call("getWebhookInfo", {});
  }

  setWebhook(url: string) {
    return this.call("setWebhook", { url });
  }
}
