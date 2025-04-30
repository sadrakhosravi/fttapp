'use client';

import * as jsPDF from 'jspdf';

// Types
import type { Matrix } from '@/algorithm/ThroatUnwrap';
import { PageSize, PAGE_DIMENSIONS, RGBColor } from './constants';

export const createPDF = (
  Vuv: Matrix,
  edges: number[],
  color: RGBColor = { r: 0, g: 0, b: 0 }, // default black color
  padding = 25.4 * 2, // 1 inch = 72 points, default 1-inch padding
  strokeThickness = 0.5, // default line thickness in mm
  pageSize = PageSize.A4,
  isLandscape = false, // default to portrait
) => {
  // Get the dimensions for the selected page size
  let {
    pts: [pageWidth, pageHeight],
    mm: [pageWidthMm, pageHeightMm],
  } = PAGE_DIMENSIONS[pageSize];

  // Swap dimensions if in landscape mode
  if (isLandscape) {
    [pageWidth, pageHeight] = [pageHeight, pageWidth];
    [pageWidthMm, pageHeightMm] = [pageHeightMm, pageWidthMm];
  }

  const effectiveWidth = pageWidth - 2 * padding;
  const effectiveHeight = pageHeight - 2 * padding;
  const cm2pxw = (10 * effectiveWidth) / pageWidthMm;
  const cm2pxh = (10 * effectiveHeight) / pageHeightMm;

  // Get the minimum and maximum values in X and Y coordinates
  const minx = Math.min(...Vuv.map((row) => row[0]));
  const maxx = Math.max(...Vuv.map((row) => row[0]));
  const miny = Math.min(...Vuv.map((row) => row[1]));
  const maxy = Math.max(...Vuv.map((row) => row[1]));

  if (maxx - minx >= effectiveWidth || maxy - miny >= effectiveHeight) {
    console.warn(
      `Shape is larger than the page and will be cut off: ${maxx - minx}x${maxy - miny} cutout on ${effectiveWidth}x${effectiveHeight} paper`,
    );
  }

  // Create a new PDF document with the correct page size and orientation
  const doc = new jsPDF.jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: pageSize,
  });

  // Calculate conversion from points to mm
  const pointToMmWidth = pageWidthMm / pageWidth;
  const pointToMmHeight = pageHeightMm / pageHeight;

  // Set the drawing color and line thickness
  doc.setDrawColor(color.r, color.g, color.b);
  doc.setLineWidth(strokeThickness);

  const offset = padding + 5; // Additional offset from the padding
  for (let i = 0; i < edges.length; i += 2) {
    const x0Points = offset + (Vuv[edges[i]][0] - minx) * cm2pxw;
    const x1Points = offset + (Vuv[edges[i + 1]][0] - minx) * cm2pxw;
    const y0Points = pageHeight - (offset + (Vuv[edges[i]][1] - miny) * cm2pxh);
    const y1Points = pageHeight - (offset + (Vuv[edges[i + 1]][1] - miny) * cm2pxh);

    // Convert from points to mm
    const x0 = x0Points * pointToMmWidth;
    const x1 = x1Points * pointToMmWidth;
    const y0 = y0Points * pointToMmHeight;
    const y1 = y1Points * pointToMmHeight;

    doc.line(x0, y0, x1, y1); // Draw the line
  }

  // Generate the PDF as a Blob
  const pdfBlob = doc.output('blob');

  return pdfBlob;
};
