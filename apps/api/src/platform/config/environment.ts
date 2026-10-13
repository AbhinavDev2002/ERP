import { z } from "zod";

const portSchema = z
  .string()
  .regex(/^\d+$/)
  .transform(Number)
  .pipe(z.number().int().min(1).max(65535));

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) =>
    value === undefined || value.length === 0 ? undefined : value,
  );

export const environmentSchema = z
  .object({
    HOST: z.string().trim().min(1).default("0.0.0.0"),
    PORT: z.preprocess((value) => {
      if (value === undefined || value === "") {
        return "4000";
      }

      return value;
    }, portSchema),
    NODE_ENV: z.string().trim().min(1).default("development"),
    DATABASE_URL: z
      .string()
      .refine(isPostgresUrl, "DATABASE_URL must be a postgres URL"),
    TEST_DATABASE_URL: z
      .string()
      .refine(isPostgresUrl, "TEST_DATABASE_URL must be a postgres URL")
      .optional(),
    REDIS_URL: z.string().refine(isRedisUrl, "REDIS_URL must be a redis URL"),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.string().url(),
    WEB_ORIGIN: z.string().url(),
    GOOGLE_CLIENT_ID: optionalText,
    GOOGLE_CLIENT_SECRET: optionalText,
    MICROSOFT_CLIENT_ID: optionalText,
    MICROSOFT_CLIENT_SECRET: optionalText,
    SMTP_HOST: optionalText,
    SMTP_PORT: z.preprocess((value) => {
      if (value === undefined || value === "") {
        return undefined;
      }

      return value;
    }, portSchema.optional()),
    SMTP_FROM: z.string().trim().min(1).default("noreply@localhost"),
    PLATFORM_ADMIN_USER_IDS: optionalText,
  })
  .superRefine((value, context) => {
    requirePair(
      context,
      value.GOOGLE_CLIENT_ID,
      value.GOOGLE_CLIENT_SECRET,
      "GOOGLE_CLIENT_ID",
      "GOOGLE_CLIENT_SECRET",
    );
    requirePair(
      context,
      value.MICROSOFT_CLIENT_ID,
      value.MICROSOFT_CLIENT_SECRET,
      "MICROSOFT_CLIENT_ID",
      "MICROSOFT_CLIENT_SECRET",
    );
  });

export type Environment = z.infer<typeof environmentSchema>;

export function loadEnvironment(
  source: NodeJS.ProcessEnv = process.env,
): Environment {
  return environmentSchema.parse({
    HOST: source.HOST,
    PORT: source.PORT,
    NODE_ENV: source.NODE_ENV,
    DATABASE_URL: source.DATABASE_URL,
    TEST_DATABASE_URL: source.TEST_DATABASE_URL,
    REDIS_URL: source.REDIS_URL,
    BETTER_AUTH_SECRET: source.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: source.BETTER_AUTH_URL,
    WEB_ORIGIN: source.WEB_ORIGIN,
    GOOGLE_CLIENT_ID: source.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: source.GOOGLE_CLIENT_SECRET,
    MICROSOFT_CLIENT_ID: source.MICROSOFT_CLIENT_ID,
    MICROSOFT_CLIENT_SECRET: source.MICROSOFT_CLIENT_SECRET,
    SMTP_HOST: source.SMTP_HOST,
    SMTP_PORT: source.SMTP_PORT,
    SMTP_FROM: source.SMTP_FROM,
    PLATFORM_ADMIN_USER_IDS: source.PLATFORM_ADMIN_USER_IDS,
  });
}

function requirePair(
  context: z.RefinementCtx,
  left: string | undefined,
  right: string | undefined,
  leftKey: string,
  rightKey: string,
): void {
  if ((left === undefined) === (right === undefined)) {
    return;
  }

  context.addIssue({
    code: "custom",
    message: `${leftKey} and ${rightKey} must be set together`,
    path: [left === undefined ? leftKey : rightKey],
  });
}

function isPostgresUrl(value: string): boolean {
  return hasProtocol(value, ["postgres:", "postgresql:"]);
}

function isRedisUrl(value: string): boolean {
  return hasProtocol(value, ["redis:"]);
}

function hasProtocol(value: string, protocols: readonly string[]): boolean {
  try {
    const url = new URL(value);
    return protocols.includes(url.protocol) && url.hostname.length > 0;
  } catch {
    return false;
  }
}
