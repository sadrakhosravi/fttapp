import { sampleOnSpiral } from './ThroatUnwrap';
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

// Test function to run sampleOnSpiral and save results to a file
function testSampleOnSpiral(filePath: string, params: TestParams) {
  // Call the function
  const [result, ch, cr] = sampleOnSpiral(
    params.r1,
    params.r2,
    params.h,
    params.cut_angle,
    params.theta,
    params.equidistant
  );

  // Ensure the directory exists
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Save results to a file
  const output = `
    Test Parameters:
    r1: ${params.r1}
    r2: ${params.r2}
    h: ${params.h}
    cut_angle: ${params.cut_angle}
    theta: ${params.theta}
    equidistant: ${params.equidistant ? 'true' : 'false'}

    Outputs:
    ch: ${ch}
    cr: ${cr}
    Result Vector: (${result[0]}, ${result[1]}, ${result[2]})
    `;

  fs.writeFileSync(filePath, output);
  console.log(`Test results saved to ${filePath}`);
}

// Function to run tests
function runTestOnSpiral() {
  const params1: TestParams = {
    r1: 1.0,
    r2: 2.0,
    h: 3.0,
    cir_res: 100,
    cut_angle: Math.PI / 4,
    theta: Math.PI / 3,
    equidistant: true
  };
  const filePath1 = './results/test_sample_on_spiral_1.txt';
  testSampleOnSpiral(filePath1, params1);

  const params2: TestParams = {
    r1: 3.0,
    r2: 1.0,
    h: 1.2,
    cir_res: 100,
    cut_angle: Math.PI / 3,
    theta: Math.PI / 4,
    equidistant: false
  };
  const filePath2 = './results/test_sample_on_spiral_2.txt';
  testSampleOnSpiral(filePath2, params2);

  const params3: TestParams = {
    r1: 2.1,
    r2: 2.0,
    h: 3.0,
    cir_res: 100,
    cut_angle: Math.PI / 4,
    theta: Math.PI / 3,
    equidistant: false
  };
  const filePath3 = './results/test_sample_on_spiral_3.txt';
  testSampleOnSpiral(filePath3, params3);
}

// Main function to execute the tests
runTestOnSpiral();
