import { z } from 'zod';

export const cir_res_map = {
  low: 50,
  medium: 100,
  high: 500,
};

export const parameterFormSchema = z.object({
  r1: z.number().min(0).max(255),
  r2: z.number().min(0).max(255),
  h: z.number().min(0).max(255),
  cir_res: z.enum(['low', 'medium', 'high']),

  cut_angle: z.union([z.literal(15), z.literal(30), z.literal(45), z.literal(60), z.literal(90)]),
  equidistant: z.enum(['yes', 'no']),
});
