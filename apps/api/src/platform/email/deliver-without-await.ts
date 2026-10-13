import type { EmailSender, OutboundEmail } from "./email-sender.js";

export function deliverWithoutAwait(
  sender: EmailSender,
  message: OutboundEmail,
  onFailure: (errorName: string) => void,
): void {
  void sender.send(message).catch((error: unknown) => {
    onFailure(error instanceof Error ? error.name : "UnknownError");
  });
}
