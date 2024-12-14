import jsPDF from 'jspdf';

// Types
import type { Matrix } from '@/algorithm/ThroatUnwrap';

interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export const createPDF = (
  Vuv: Matrix,
  edges: number[],
  color: RGBColor = { r: 0, g: 0, b: 0 }, // default black color
  padding = 25.4 * 2, // 1 inch = 72 points, default 1-inch padding
  strokeThickness = 0.5, // default line thickness in mm
  pageSize = 'a4',
) => {
  const pageWidth = 595; // A4 width in points
  const pageHeight = 842; // A4 height in points
  const effectiveWidth = pageWidth - 2 * padding;
  const effectiveHeight = pageHeight - 2 * padding;
  const cm2pxw = (10 * effectiveWidth) / 210;
  const cm2pxh = (10 * effectiveHeight) / 297;

  // Get the minimum and maximum values in X and Y coordinates
  const minx = Math.min(...Vuv.map((row) => row[0]));
  const maxx = Math.max(...Vuv.map((row) => row[0]));
  const miny = Math.min(...Vuv.map((row) => row[1]));
  const maxy = Math.max(...Vuv.map((row) => row[1]));

  if (maxx - minx >= effectiveWidth || maxy - miny >= effectiveHeight) {
    console.error(
      `[ERROR] Cannot fit ${maxx - minx}x${maxy - miny} cutout on ${effectiveWidth}x${effectiveHeight} paper`,
    );
    return;
  }

  // Create a new PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: pageSize,
  });

  // Calculate conversion from points to mm
  const pointToMmWidth = 210 / 595;
  const pointToMmHeight = 297 / 842;

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
