import { z } from 'zod';

const envs = z.object({
  NODE_ENV: z.string().optional(),
  DATABASE_HOST: z.string(),
  DATABASE_PORT: z.coerce.number(),
  DATABASE_USER: z.string(),
  DATABASE_PASSWORD: z.string(),
  DATABASE_NAME: z.string(),
  THESPORTSDB_API_KEY: z.string(),
  THESPORTSDB_BASE_URL: z.string(),
  THESPORTSDB_RATE_LIMIT_PER_MIN: z.coerce.number(),
  THESPORTSDB_RATE_LIMIT_PER_SEC: z.coerce.number(),
  OPENMETEO_RATE_LIMIT_PER_MIN: z.coerce.number(),
  OPENMETEO_BASE_URL: z.string(),
  OPENMETEO_RATE_LIMIT_PER_SEC: z.coerce.number(),
  UPCOMING_DAYS_LIMIT: z.coerce.number(),
  OPENROUTER_API_KEY: z.string(),
  OPENROUTER_MODEL: z.string(),
  THROTTLE_TTL: z.coerce.number(),
  THROTTLE_LIMIT: z.coerce.number(),
});

export const validate = (config: Record<string, unknown>) => {
  const validated = envs.parse(config);
  return validated;
};

type Env = z.infer<typeof envs>;

export type EnvType = {
  [K in keyof Env]: Env[K] extends string ? string : Env[K];
};
