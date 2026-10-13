import { AsyncLocalStorage } from "node:async_hooks";

import type { TransactionRunner } from "../../core/execution/transaction-runner.js";
import type { TenantPrismaClient } from "./create-tenant-prisma-client.js";

export type TenantTransaction = Parameters<
  Parameters<TenantPrismaClient["$transaction"]>[0]
>[0];

export const transactionStorage = new AsyncLocalStorage<TenantTransaction>();

export class PrismaTransactionRunner implements TransactionRunner {
  constructor(private readonly database: TenantPrismaClient) {}

  run<T>(work: () => Promise<T>): Promise<T> {
    return this.database.$transaction((transaction) =>
      transactionStorage.run(transaction, work),
    );
  }
}
