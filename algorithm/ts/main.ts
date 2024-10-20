import * as fs from 'fs';
import { createCylinderWithCut, unwarpCylinder } from './ThroatUnwrap'; // Import your functions from their file

// Main function
function main(args: string[]) {
  let outfile = 'test.ps';
  let r1: number, r2: number, h: number, cut_angle: number;
  let equidistant = false;
  const cir_res = 100; // Default resolution (you can modify as per requirement)

  console.log(args.unshift('0'));

  if (args.length < 5) {
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

  const width = 595; // In pixels
  const height = 842; // In pixels
  const cm2pxw = (10 * width) / 210;
  const cm2pxh = (10 * height) / 297;

  // Get the minimum and maximum values in X and Y coordinates
  const minx = Math.min(...Vuv.map((row) => row[0]));
  const maxx = Math.max(...Vuv.map((row) => row[0]));
  const miny = Math.min(...Vuv.map((row) => row[1]));
  const maxy = Math.max(...Vuv.map((row) => row[1]));

  if (maxx - minx >= width || maxy - miny >= height) {
    console.log(
      `[ERROR] Cannot fit ${maxx - minx}x${maxy - miny} cutout on ${width}x${height} paper`
    );
  } else {
    // Create output file and write content
    const stream = fs.createWriteStream(outfile);
    stream.write('0 0 moveto\n');
    stream.write(`${width} 0 lineto\n`); // Horizontal bar
    stream.write(`${width} 0 closepath\n`); // Horizontal bar
    stream.write('0 0 moveto\n');
    stream.write(`0 ${height} lineto\n`); // Vertical bar
    stream.write(`0 ${height} closepath\n`); // Vertical bar

    const offset = 5;
    for (let i = 0; i < edges.length; i += 2) {
      const x0 = offset + (Vuv[edges[i]][0] - minx) * cm2pxw;
      const x1 = offset + (Vuv[edges[i + 1]][0] - minx) * cm2pxw;
      const y0 = offset + (Vuv[edges[i]][1] - miny) * cm2pxh;
      const y1 = offset + (Vuv[edges[i + 1]][1] - miny) * cm2pxh;
      stream.write(`${x0} ${y0} moveto\n`);
      stream.write(`${x1} ${y1} lineto\n`);
      stream.write(`${x1} ${y1} closepath\n`);
    }
    stream.write('0 setlinewidth stroke\n');
    stream.write('showpage\n');
    stream.end();
  }
}

// Convert the command-line arguments to the array format expected
const args = process.argv.slice(2);
main(args);
