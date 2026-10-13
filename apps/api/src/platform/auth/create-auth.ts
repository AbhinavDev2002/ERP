import { AsyncLocalStorage } from "node:async_hooks";

import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins/email-otp";
import { organization } from "better-auth/plugins/organization";
import type { PrismaClient } from "@prisma/client";
import type { RedisClientType } from "redis";

import {
  accessControl,
  assertMemberRoleChange,
  MemberRoleChangeError,
  organizationRoles,
} from "../../modules/authorization/index.js";
import type { Environment } from "../config/environment.js";
import { deliverWithoutAwait } from "../email/deliver-without-await.js";
import type { EmailSender } from "../email/email-sender.js";
import {
  createRedisSecondaryStorage,
  type RateLimitRedis,
} from "./redis-secondary-storage.js";

const requestStorage = new AsyncLocalStorage<Request>();
const otpWindowSeconds = 10 * 60;
const invitationLifetimeSeconds = 48 * 60 * 60;

export interface AuthLogger {
  error(message: string): void;
}

export interface CreateAuthDependencies {
  readonly environment: Environment;
  readonly database: PrismaClient;
  readonly cache: RedisClientType;
  readonly emailSender: EmailSender;
  readonly logger: AuthLogger;
}

export function createAuth(dependencies: CreateAuthDependencies) {
  const { environment, database, emailSender, logger } = dependencies;
  let readSessionUserId: (
    request: Request,
  ) => Promise<string | null> = async () => null;

  async function actorRoleNames(organizationId: string): Promise<string[]> {
    const request = requestStorage.getStore();
    if (!request) {
      return [];
    }

    const userId = await readSessionUserId(request);
    if (!userId) {
      return [];
    }

    const member = await database.member.findFirst({
      where: { userId, organizationId },
      select: { role: true },
    });
    return member ? roleNames(member.role) : [];
  }

  async function assertCanGrantOwner(organizationId: string): Promise<void> {
    try {
      assertMemberRoleChange({
        actorRoles: await actorRoleNames(organizationId),
        currentRole: "employee",
        nextRole: "owner",
        ownerCount: 2,
      });
    } catch (error: unknown) {
      if (error instanceof MemberRoleChangeError) {
        throw new APIError("FORBIDDEN", {
          message: "You cannot change this role",
        });
      }
      throw error;
    }
  }

  async function countOwners(organizationId: string): Promise<number> {
    const members = await database.member.findMany({
      where: { organizationId },
      select: { role: true },
    });
    return members.filter((member) => roleNames(member.role).includes("owner"))
      .length;
  }

  const auth = betterAuth({
    appName: "ERP",
    baseURL: environment.BETTER_AUTH_URL,
    basePath: "/api/auth",
    secret: environment.BETTER_AUTH_SECRET,
    trustedOrigins: [environment.WEB_ORIGIN],
    database: prismaAdapter(database, { provider: "postgresql" }),
    secondaryStorage: createRedisSecondaryStorage(
      redisCommands(dependencies.cache),
    ),
    emailAndPassword: { enabled: false },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
      storeSessionInDatabase: true,
      cookieCache: { enabled: true, maxAge: 5 * 60 },
    },
    account: {
      accountLinking: {
        enabled: true,
        disableImplicitLinking: true,
        allowDifferentEmails: false,
      },
      encryptOAuthTokens: true,
    },
    verification: { storeIdentifier: "hashed" },
    rateLimit: {
      enabled: true,
      storage: "secondary-storage",
      customRules: {
        "/email-otp/send-verification-otp": {
          window: otpWindowSeconds,
          max: environment.NODE_ENV === "test" ? 50 : 5,
        },
        "/sign-in/email-otp": {
          window: otpWindowSeconds,
          max: environment.NODE_ENV === "test" ? 50 : 5,
        },
      },
    },
    advanced: {
      useSecureCookies: environment.NODE_ENV === "production",
    },
    socialProviders: {
      ...(environment.GOOGLE_CLIENT_ID && environment.GOOGLE_CLIENT_SECRET
        ? {
            google: {
              clientId: environment.GOOGLE_CLIENT_ID,
              clientSecret: environment.GOOGLE_CLIENT_SECRET,
            },
          }
        : {}),
      ...(environment.MICROSOFT_CLIENT_ID && environment.MICROSOFT_CLIENT_SECRET
        ? {
            microsoft: {
              clientId: environment.MICROSOFT_CLIENT_ID,
              clientSecret: environment.MICROSOFT_CLIENT_SECRET,
              tenantId: "common",
            },
          }
        : {}),
    },
    logger: {
      level: "error",
      log(_level, message) {
        logger.error(redactDigits(message));
      },
    },
    hooks: {
      before: createAuthMiddleware(async (context) => {
        if (context.request) {
          requestStorage.enterWith(context.request);
        }
      }),
    },
    plugins: [
      emailOTP({
        otpLength: 6,
        expiresIn: 300,
        allowedAttempts: 3,
        storeOTP: "hashed",
        resendStrategy: "rotate",
        disableSignUp: false,
        sendVerificationOTP({ email, otp, type }) {
          const subject =
            type === "sign-in" ? "Your sign-in code" : "Your verification code";
          deliverWithoutAwait(
            emailSender,
            {
              to: email,
              subject,
              text: `Your code is ${otp}. It expires in 5 minutes.`,
            },
            () => {
              logger.error("email delivery failed");
            },
          );
          return Promise.resolve();
        },
      }),
      organization({
        ac: accessControl,
        roles: organizationRoles,
        dynamicAccessControl: { enabled: true },
        creatorRole: "owner",
        allowUserToCreateOrganization: async () => true,
        organizationLimit: 5,
        requireEmailVerificationOnInvitation: true,
        cancelPendingInvitationsOnReInvite: true,
        invitationExpiresIn: invitationLifetimeSeconds,
        sendInvitationEmail(data) {
          deliverWithoutAwait(
            emailSender,
            {
              to: data.email,
              subject: `Invitation to ${data.organization.name}`,
              text: `Open ${environment.WEB_ORIGIN}/invitations/${data.id} to respond. The invitation expires in 48 hours.`,
            },
            () => {
              logger.error("email delivery failed");
            },
          );
          return Promise.resolve();
        },
        organizationHooks: {
          async beforeCreateInvitation(data) {
            const requested = data.invitation.role.trim();
            const role =
              requested.length === 0 || requested === "member"
                ? "employee"
                : requested;
            if (roleNames(role).includes("owner")) {
              await assertCanGrantOwner(data.organization.id);
            }
            return { data: { ...data.invitation, role } };
          },
          async beforeUpdateMemberRole(data) {
            try {
              assertMemberRoleChange({
                actorRoles: await actorRoleNames(data.organization.id),
                currentRole: data.member.role,
                nextRole: data.newRole,
                ownerCount: await countOwners(data.organization.id),
              });
            } catch (error: unknown) {
              if (error instanceof MemberRoleChangeError) {
                throw new APIError("FORBIDDEN", {
                  message: "You cannot change this role",
                });
              }
              throw error;
            }
          },
        },
      }),
    ],
  });

  readSessionUserId = async (request) => {
    const session = await auth.api.getSession({
      headers: request.headers,
      query: { disableCookieCache: true },
    });
    return session?.user.id ?? null;
  };

  return auth;
}

export type AppAuth = ReturnType<typeof createAuth>;

function roleNames(value: string): string[] {
  return value
    .split(",")
    .map((role) => role.trim())
    .filter((role) => role.length > 0);
}

function redactDigits(message: string): string {
  return message.replace(/\b\d{4,}\b/g, "[redacted]");
}

function redisCommands(client: RedisClientType): RateLimitRedis {
  return {
    get: (key) => client.get(key),
    getDel: (key) => client.getDel(key),
    async set(key, value, options) {
      if (!options) {
        return client.set(key, value);
      }

      if (options.NX) {
        return client.set(key, value, { EX: options.EX, NX: true });
      }

      return client.set(key, value, { EX: options.EX });
    },
    incr: (key) => client.incr(key),
    del: (key) => client.del(key),
  };
}
