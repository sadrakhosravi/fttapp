import { z } from 'zod';

export const pageControlsSchema = z.object({
  size: z.enum(['A4', 'Letter', 'A5']),
  orientation: z.enum(['Portrait', 'Landscape']),
  margins: z.enum(['Narrow', 'Normal', 'Wide']),
});
