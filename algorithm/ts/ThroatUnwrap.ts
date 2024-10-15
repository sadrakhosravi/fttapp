// Define Vector3d as a tuple type
type Vector3d = [number, number, number];

// Define Matrix as an array of Vector3d
type Matrix = Vector3d[];

export function sampleOnSpiral(
  r1: number,
  r2: number,
  h: number,
  cutAngle: number,
  theta: number,
  equidistant: boolean
): [Vector3d, number, number] {
  let ch: number;

  if (equidistant) {
    ch = Math.tan(cutAngle) * theta; // h(theta)
  } else {
    // solution to first-order ODE (using integrating factor)
    const c1 = -Math.tan(cutAngle) * ((r2 - r1) / h);
    const c2 = Math.tan(cutAngle) * r1;
    ch = c2 / c1 - (c2 / c1) * Math.exp(-c1 * theta);
  }

  ch = Math.max(0, Math.min(ch, h));
  const cr = r1 + ((r2 - r1) / h) * ch; // r(h)

  return [[Math.sin(theta) * cr, ch, Math.cos(theta) * cr], ch, cr];
}

export function createCylinderWithCut(
  r1: number,
  r2: number,
  h: number,
  circleRes: number,
  cutAngle: number,
  equidistant: boolean
): [Matrix, number[][], Matrix, number[], number[]] {
  let V: Matrix = [];
  let F: number[][] = [];
  let P: Matrix = [];
  let edges: number[] = [];
  const corrs: number[] = [];

  if (cutAngle === -1) {
    // Same as before
    // ...
  } else {
    const pnts: Vector3d[] = [];
    const vertices: Vector3d[] = [];
    const faces: [number, number, number][] = [];
    let theta = -2 * Math.PI;
    let id = 0;
    let lastId = -1;
    const epsilonH = h / 100;
    let maxiter = 1000000;

    while ((lastId < 0 || id < lastId) && maxiter > 0) {
      maxiter--;

      // Sample p1
      const [p1, ch] = sampleOnSpiral(r1, r2, h, cutAngle, theta, equidistant);

      if (theta >= 0 && ch < h) {
        pnts.push([...p1]); // Store a copy of p1 in pnts
      }

      vertices.push([...p1]); // Store a copy of p1 in vertices

      // Modify p1[1] after adding to vertices to avoid affecting the stored vertex
      p1[1] += epsilonH;

      if (ch === h && lastId === -1) {
        lastId = id + circleRes;
      }

      // Sample p3
      const [p3] = sampleOnSpiral(r1, r2, h, cutAngle, theta + 2 * Math.PI, equidistant);

      // Adjust p3[1]
      p3[1] -= epsilonH;
      vertices.push([...p3]); // Store a copy of p3 in vertices

      if (lastId < 0) {
        edges.push(2 * id + 0, 2 * (id + 1) + 0, 2 * id + 1, 2 * (id + 1) + 1);

        // Add faces
        faces.push([2 * id + 0, 2 * (id + 1) + 0, 2 * id + 1]);
        faces.push([2 * id + 1, 2 * (id + 1) + 0, 2 * (id + 1) + 1]);
      }

      id++;
      theta = -2 * Math.PI + (id * 2 * Math.PI) / circleRes;
    }

    P = pnts;
    V = vertices;
    F = faces.slice(0, -1);
    edges = edges.slice(0, -4);
  }

  return [V, F, P, edges, corrs];
}
