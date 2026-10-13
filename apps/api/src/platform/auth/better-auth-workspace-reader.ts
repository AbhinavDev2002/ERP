import type { PrismaClient } from "@prisma/client";

import { permissionMapForRoles } from "../../modules/authorization/index.js";
import type {
  WorkspaceContext,
  WorkspaceContextReader,
} from "../../modules/organization/application/workspace-context-reader.js";
import type { AppAuth } from "./create-auth.js";
import { cookieHeaders } from "./better-auth-session-gateway.js";

export class BetterAuthWorkspaceReader implements WorkspaceContextReader {
  constructor(
    private readonly auth: AppAuth,
    private readonly database: PrismaClient,
  ) {}

  async read(cookieHeader: string): Promise<WorkspaceContext | null> {
    const session = await this.auth.api.getSession({
      headers: cookieHeaders(cookieHeader),
      query: { disableCookieCache: true },
    });
    if (!session) {
      return null;
    }

    const members = await this.database.member.findMany({
      where: { userId: session.user.id },
      include: { organization: true },
      orderBy: { createdAt: "asc" },
    });
    const activeOrganizationId =
      typeof session.session.activeOrganizationId === "string"
        ? session.session.activeOrganizationId
        : null;
    const active = members.find(
      (member) => member.organizationId === activeOrganizationId,
    );

    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        emailVerified: session.user.emailVerified,
      },
      organizations: members.map((member) => ({
        id: member.organization.id,
        name: member.organization.name,
        slug: member.organization.slug,
        role: member.role,
      })),
      activeOrganizationId,
      permissions: permissionMapForRoles(active ? roleNames(active.role) : []),
    };
  }
}

function roleNames(value: string): string[] {
  return value
    .split(",")
    .map((role) => role.trim())
    .filter((role) => role.length > 0);
}
