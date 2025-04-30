'use client';

import { z } from 'zod';
import { cutAngleOptions } from '../data/control-options';

export const cir_res_map = {
  low: 50,
  medium: 100,
  high: 500,
};

export const parameterFormSchema = z.object({
  r1: z.number().min(4).max(20),
  r2: z.number().min(4).max(20),
  h: z.number().min(4).max(20),
  cir_res: z.enum(['low', 'medium', 'high']),
  cut_angle: z
    .number()
    .refine((val) => cutAngleOptions.some((option) => parseInt(option.value) === val), {
      message: 'Invalid cut angle value',
    }),
  equidistant: z.enum(['yes', 'no']),
});
