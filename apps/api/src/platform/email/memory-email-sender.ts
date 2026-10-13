import type { EmailSender, OutboundEmail } from "./email-sender.js";

export class MemoryEmailSender implements EmailSender {
  readonly messages: OutboundEmail[] = [];

  async send(message: OutboundEmail): Promise<void> {
    this.messages.push(message);
  }
}
