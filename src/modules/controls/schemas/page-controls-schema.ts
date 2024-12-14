import { z } from 'zod';

export const margins = {
  narrow: 10,
  ormal: 20,
  wide: 30,
};

export const pageControlsSchema = z.object({
  size: z.enum(['A4']),
  orientation: z.enum(['Portrait']),
  exportType: z.enum(['PDF']),
  // margins: z.enum(['Narrow', 'Normal', 'Wide']),
});
