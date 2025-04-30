'use client';

// Define standard page sizes in millimeters and corresponding points
export enum PageSize {
  A4 = 'a4',
  A3 = 'a3',
  LETTER = 'letter',
  LEGAL = 'legal',
}

// Page dimensions [width, height] in mm and points
export interface PageDimensions {
  mm: [number, number];
  pts: [number, number];
}

export const PAGE_DIMENSIONS: Record<PageSize, PageDimensions> = {
  [PageSize.A4]: {
    mm: [210, 297],
    pts: [595, 842],
  },
  [PageSize.A3]: {
    mm: [297, 420],
    pts: [842, 1191],
  },
  [PageSize.LETTER]: {
    mm: [215.9, 279.4],
    pts: [612, 792],
  },
  [PageSize.LEGAL]: {
    mm: [215.9, 355.6],
    pts: [612, 1008],
  },
};

export interface RGBColor {
  r: number;
  g: number;
  b: number;
}
