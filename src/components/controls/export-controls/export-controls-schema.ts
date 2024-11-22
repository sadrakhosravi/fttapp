import { z } from 'zod';

export const exportControlSchema = z.object({
  fileType: z.enum(['pdf', 'png', 'jpg', 'svg']),
});
