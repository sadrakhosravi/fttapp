'use client';

import { PageSize } from '@/modules/pdf/constants';
import { z } from 'zod';

export const margins = {
  narrow: 10,
  ormal: 20,
  wide: 30,
};

export const pageControlsSchema = z.object({
  size: z.enum([PageSize.A4, PageSize.A3, PageSize.LETTER, PageSize.LEGAL]),
  orientation: z.enum(['Portrait', 'Landscape']),
  exportType: z.enum(['PDF']),
  // margins: z.enum(['Narrow', 'Normal', 'Wide']),
});
