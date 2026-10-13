import { describe, expect, it } from "vitest";

import { deliverWithoutAwait } from "./deliver-without-await.js";
import type { EmailSender } from "./email-sender.js";

describe("deliverWithoutAwait", () => {
  it("returns before the sender finishes and reports only the error name", async () => {
    let resolveSend: (() => void) | undefined;
    const sender: EmailSender = {
      send: () =>
        new Promise((_resolve, reject) => {
          resolveSend = () => {
            reject(new Error("smtp refused the secret code 123456"));
          };
        }),
    };
    const failures: string[] = [];

    deliverWithoutAwait(
      sender,
      {
        to: "owner@example.com",
        subject: "Your sign-in code",
        text: "Your code is 123456",
      },
      (errorName) => {
        failures.push(errorName);
      },
    );

    expect(failures).toEqual([]);
    resolveSend?.();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(failures).toEqual(["Error"]);
  });
});
