import type { PrismaClient } from "@prisma/client";

import type {
  AuthenticatedSession,
  SessionCredentials,
  SessionGateway,
} from "../../modules/organization/application/session-gateway.js";
import type { AppAuth } from "./create-auth.js";

export class BetterAuthSessionGateway implements SessionGateway {
  constructor(
    private readonly auth: AppAuth,
    private readonly database: PrismaClient,
  ) {}

  async resolve(
    credentials: SessionCredentials,
  ): Promise<AuthenticatedSession | null> {
    const session = await this.auth.api.getSession({
      headers: cookieHeaders(credentials.cookieHeader),
      query: { disableCookieCache: true },
    });
    if (!session) {
      return null;
    }

    const members = await this.database.member.findMany({
      where: { userId: session.user.id },
      select: { organizationId: true },
    });
    const activeOrganizationId = session.session.activeOrganizationId;

    return {
      userId: session.user.id,
      activeOrganizationId:
        typeof activeOrganizationId === "string" ? activeOrganizationId : null,
      memberOrganizationIds: members.map((member) => member.organizationId),
    };
  }
}

export function cookieHeaders(cookieHeader: string): Headers {
  const headers = new Headers();
  if (cookieHeader.length > 0) {
    headers.set("cookie", cookieHeader);
  }
  return headers;
}
