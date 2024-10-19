import { createCylinderWithCut } from './ThroatUnwrap';
import * as fs from 'fs';
import * as path from 'path';

// Define TestParams to match the structure of the C++ version
interface TestParams {
  r1: number;
  r2: number;
  h: number;
  cir_res: number;
  cut_angle: number;
  theta: number;
  ch: number;
  cr: number;
  equidistant: boolean;
}

// Test function to run createCylinderWithCut and save results to a file
function testCreateCylinderWithCut(filePath: string, params: TestParams) {
  // Call the function
  const [V, F, P, edges] = createCylinderWithCut(
    params.r1,
    params.r2,
    params.h,
    params.cir_res,
    params.cut_angle,
    params.equidistant
  );

  // Ensure the directory exists
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Prepare the output string
  let output = `Test Parameters:
r1: ${params.r1}
r2: ${params.r2}
h: ${params.h}
circle_res: ${params.cir_res}
cut_angle: ${params.cut_angle}
theta: ${params.theta}
ch: ${params.ch}
cr: ${params.cr}
equidistant: ${params.equidistant ? 'true' : 'false'}

Vertices (V):
`;

  // Add vertices to the output
  V.forEach((vertex) => {
    output += `${vertex[0]} ${vertex[1]} ${vertex[2]}\n`;
  });

  // Add faces to the output
  output += '\nFaces (F):\n';
  F.forEach((face) => {
    output += `${face[0]} ${face[1]} ${face[2]}\n`;
  });

  // Add points to the output
  output += '\nPoints (P):\n';
  P.forEach((point) => {
    output += `${point[0]} ${point[1]} ${point[2]}\n`;
  });

  // Add edges to the output
  output += '\nEdges:\n';
  for (let i = 0; i < edges.length; i += 2) {
    output += `${edges[i]} ${edges[i + 1]}\n`;
  }

  // Write the output to a file
  fs.writeFileSync(filePath, output);
  console.log(`Test results saved to ${filePath}`);
}

// Function to run multiple test cases
function runTests() {
  const params1: TestParams = {
    r1: 1.0,
    r2: 0.8,
    h: 2.0,
    cir_res: 100,
    cut_angle: Math.PI / 4,
    theta: 0.0,
    ch: 0.0,
    cr: 0.0,
    equidistant: true
  };
  const filePath1 = './results/test_createCylinderWithCut_1.txt';
  testCreateCylinderWithCut(filePath1, params1);

  const params2: TestParams = {
    r1: 2.0,
    r2: 1.5,
    h: 3.0,
    cir_res: 150,
    cut_angle: Math.PI / 6,
    theta: 0.0,
    ch: 0.0,
    cr: 0.0,
    equidistant: false
  };
  const filePath2 = './results/test_createCylinderWithCut_2.txt';
  testCreateCylinderWithCut(filePath2, params2);

  const params3: TestParams = {
    r1: 1.5,
    r2: 1.2,
    h: 2.5,
    cir_res: 120,
    cut_angle: Math.PI / 3,
    theta: 0.0,
    ch: 0.0,
    cr: 0.0,
    equidistant: true
  };
  const filePath3 = './results/test_createCylinderWithCut_3.txt';
  testCreateCylinderWithCut(filePath3, params3);
}

// Run the tests
runTests();
