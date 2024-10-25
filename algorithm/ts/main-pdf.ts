import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import { createCylinderWithCut, unwarpCylinder } from './ThroatUnwrap'; // Import your functions from their file

// Main function
function main(args: string[]) {
  let outfile = 'test.pdf'; // Set the default output file to PDF
  let r1: number, r2: number, h: number, cut_angle: number;
  let equidistant = false;
  const cir_res = 100; // Default resolution (you can modify as per requirement)
  console.log(args.unshift('0'));

  if (args.length < 6) {
    console.log(`Use: ${args[0]} circumference1 circumference2 height cut_angle outputfile`);
    console.log('     -equidistant -- test this flag');
    console.log('     NOTE: all units are centimeters, cut angle is in degrees');
    return;
  } else {
    // Convert arguments to numbers, adjusting for pi
    r1 = parseFloat(args[1]) / (2 * Math.PI);
    r2 = parseFloat(args[2]) / (2 * Math.PI);
    h = parseFloat(args[3]);
    cut_angle = (parseFloat(args[4]) / 180) * Math.PI;
    outfile = args[5];

    // Parse flags for equidistant or unknown commands
    for (let i = 6; i < args.length; i++) {
      if (args[i] === '-equidistant') {
        equidistant = true;
      } else {
        console.log(`[WARNING] Unknown command: ${args[i]}`);
      }
    }
  }

  // Call the function to generate cylinder data
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [V, F, _, edges] = createCylinderWithCut(r1, r2, h, cir_res, cut_angle, equidistant);

  // Unwarp cylinder
  const Vuv = unwarpCylinder(V, F);

  const pageWidth = 595; // Original width in pixels
  const pageHeight = 842; // Original height in pixels
  const padding = 72; // 1 inch of padding in points (1 inch = 72 points in PDF)
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
    console.log(
      `[ERROR] Cannot fit ${maxx - minx}x${maxy - miny} cutout on ${effectiveWidth}x${effectiveHeight} paper`,
    );
  } else {
    // Create a PDF document with margins
    const doc = new PDFDocument({ size: [pageWidth, pageHeight], margin: 0 });
    doc.pipe(fs.createWriteStream(outfile));

    doc.moveTo(padding, padding + effectiveHeight).closePath();
    doc.lineTo(padding, padding + effectiveHeight).closePath();

    const offset = padding + 5; // Add padding to offset
    for (let i = 0; i < edges.length; i += 2) {
      const x0 = offset + (Vuv[edges[i]][0] - minx) * cm2pxw;
      const x1 = offset + (Vuv[edges[i + 1]][0] - minx) * cm2pxw;
      // Flip the y-coordinates by subtracting from the height of the page
      const y0 = pageHeight - (offset + (Vuv[edges[i]][1] - miny) * cm2pxh);
      const y1 = pageHeight - (offset + (Vuv[edges[i + 1]][1] - miny) * cm2pxh);

      doc.moveTo(x0, y0).lineTo(x1, y1).stroke();
    }

    // Finalize the PDF document
    doc.end();
    console.log(`PDF file has been saved to ${outfile}`);
  }
}

// Convert the command-line arguments to the array format expected
const args = process.argv.slice(2);

console.time('main-pdf');
main(args);
console.timeEnd('main-pdf');
