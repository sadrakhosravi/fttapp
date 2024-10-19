import { unwarpCylinder, createCylinderWithCut } from './ThroatUnwrap';
import * as fs from 'fs';
import * as path from 'path';

// TestParams interface to match C++ structure
interface TestParams {
  r1: number;
  r2: number;
  h: number;
  cir_res: number;
  cut_angle: number;
  theta: number;
  equidistant: boolean;
}

// Test function to save the results of UnwarpCylinder to a text file
function testUnwarpCylinder(filePath: string, params: TestParams) {
  const [V, F] = createCylinderWithCut(
    params.r1,
    params.r2,
    params.h,
    params.cir_res,
    params.cut_angle,
    params.equidistant
  );

  // Call unwarpCylinder function
  const Vuv = unwarpCylinder(V, F);

  // Ensure the directory exists
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Save the results to the file
  const output: string[] = [];

  output.push('Original Vertices (V):');
  V.forEach((vertex) => {
    output.push(`${vertex[0]} ${vertex[1]} ${vertex[2]}`);
  });

  output.push('\nFaces (F):');
  F.forEach((face) => {
    output.push(`${face[0]} ${face[1]} ${face[2]}`);
  });

  output.push('\nUnwrapped Vertices (Vuv):');
  Vuv.forEach((vertex) => {
    output.push(`${vertex[0]} ${vertex[1]} ${vertex[2]}`);
  });

  // Write the output to the file
  fs.writeFileSync(filePath, output.join('\n'));
  console.log(`Test results saved to ${filePath}`);
}

// Run the test with parameters
const params: TestParams = {
  r1: 1.0,
  r2: 0.8,
  h: 2.0,
  cir_res: 100,
  cut_angle: Math.PI / 4,
  theta: 0,
  equidistant: true
};

console.time('test_unwarp_cylinder');
testUnwarpCylinder('./results/test_unwarp_cylinder_1.txt', params);
console.timeEnd('test_unwarp_cylinder');

// Run the test with parameters
const params2: TestParams = {
  r1: 2.0,
  r2: 1.5,
  h: 3.0,
  cir_res: 150,
  cut_angle: Math.PI / 6,
  theta: 0,
  equidistant: false
};

console.time('test_unwarp_cylinder');
testUnwarpCylinder('./results/test_unwarp_cylinder_2.txt', params2);
console.timeEnd('test_unwarp_cylinder');

// Run the test with parameters
const params3: TestParams = {
  r1: 1.5,
  r2: 1.2,
  h: 2.5,
  cir_res: 120,
  cut_angle: Math.PI / 3,
  theta: 0,
  equidistant: true
};

console.time('test_unwarp_cylinder');
testUnwarpCylinder('./results/test_unwarp_cylinder_3.txt', params3);
console.timeEnd('test_unwarp_cylinder');
