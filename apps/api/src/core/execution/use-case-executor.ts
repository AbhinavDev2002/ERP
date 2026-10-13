import { AuthorizationBehavior } from "./authorization-behavior.js";
import type { ExecutionContext, UseCase } from "./execution-context.js";
import { tenantStorage } from "./tenant-context.js";
import { TenantEnforcement } from "./tenant-enforcement.js";
import type { TransactionRunner } from "./transaction-runner.js";

export class UseCaseExecutor {
  constructor(
    private readonly tenant: TenantEnforcement,
    private readonly authorization: AuthorizationBehavior,
    private readonly transaction: TransactionRunner,
  ) {}

  async execute<TInput, TOutput>(
    useCase: UseCase<TInput, TOutput>,
    input: TInput,
    context: ExecutionContext,
  ): Promise<TOutput> {
    return tenantStorage.run(
      {
        organizationId: context.organizationId,
        actorUserId: context.actorUserId,
        source: context.source,
      },
      async () => {
        this.tenant.enforce(context);
        await this.authorization.enforce(context, useCase.requiredPermission);
        const run = (): Promise<TOutput> => useCase.execute(input, context);

        if (useCase.requiresTransaction) {
          return this.transaction.run(run);
        }

        return run();
      },
    );
  }
}
