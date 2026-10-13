export interface OutboundEmail {
  readonly to: string;
  readonly subject: string;
  readonly text: string;
}

export interface EmailSender {
  send(message: OutboundEmail): Promise<void>;
}
