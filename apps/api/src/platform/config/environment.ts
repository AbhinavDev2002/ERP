import { z } from "zod";

const portSchema = z
  .string()
  .regex(/^\d+$/)
  .transform(Number)
  .pipe(z.number().int().min(1).max(65535));

export const environmentSchema = z.object({
  HOST: z.string().trim().min(1).default("0.0.0.0"),
  PORT: z.preprocess((value) => {
    if (value === undefined || value === "") {
      return "4000";
    }

    return value;
  }, portSchema),
  DATABASE_URL: z
    .string()
    .refine(isPostgresUrl, "DATABASE_URL must be a postgres URL"),
  REDIS_URL: z.string().refine(isRedisUrl, "REDIS_URL must be a redis URL"),
});

export type Environment = z.infer<typeof environmentSchema>;

export function loadEnvironment(
  source: NodeJS.ProcessEnv = process.env,
): Environment {
  return environmentSchema.parse({
    HOST: source.HOST,
    PORT: source.PORT,
    DATABASE_URL: source.DATABASE_URL,
    REDIS_URL: source.REDIS_URL,
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
