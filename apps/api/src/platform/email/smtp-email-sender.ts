import { createTransport, type Transporter } from "nodemailer";

import type { EmailSender, OutboundEmail } from "./email-sender.js";

export interface EmailLogger {
  error(message: string): void;
}

export class SmtpEmailSender implements EmailSender {
  private readonly transport: Transporter | null;

  constructor(
    private readonly logger: EmailLogger,
    private readonly from: string,
    host: string | undefined,
    port: number | undefined,
  ) {
    this.transport =
      host === undefined
        ? null
        : createTransport({
            host,
            port: port ?? 1025,
            secure: false,
          });
  }

  async send(message: OutboundEmail): Promise<void> {
    if (this.transport === null) {
      this.logger.error("email delivery unavailable");
      return;
    }

    try {
      await this.transport.sendMail({
        from: this.from,
        to: message.to,
        subject: message.subject,
        text: message.text,
      });
    } catch (error: unknown) {
      const name = error instanceof Error ? error.name : "UnknownError";
      this.logger.error(`email delivery failed: ${name}`);
    }
  }
}
