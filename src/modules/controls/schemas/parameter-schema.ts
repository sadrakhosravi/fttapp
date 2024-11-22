import { z } from 'zod';

export const parameterFormSchema = z.object({
  r1: z.number().min(0).max(255),
  r2: z.number().min(0).max(255),
  h: z.number().min(0).max(255),
  cir_res: z.number().min(0).max(255),
  cut_angle: z.number().min(0).max(360),
  equidistant: z.boolean(),
});
