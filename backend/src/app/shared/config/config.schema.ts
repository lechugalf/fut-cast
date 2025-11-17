import type { ConfigService } from '@nestjs/config';
import { z } from 'zod';

const envs = z.object({
  NODE_ENV: z.string().optional(),
  DATABASE_HOST: z.string(),
  DATABASE_PORT: z.string(),
  DATABASE_USER: z.string(),
  DATABASE_PASSWORD: z.string(),
  DATABASE_NAME: z.string(),
});

export const validate = (config: Record<string, unknown>) => {
  const validated = envs.parse(config);
  return validated;
};

export type IConfigService = ConfigService<z.infer<typeof envs>>;
