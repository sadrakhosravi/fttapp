// Define Vector3d as a tuple type
type Vector3d = [number, number, number];

// Define Matrix as an array of Vector3d
type Matrix = Vector3d[];

type Faces = [number, number, number][];

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
): [Matrix, Faces, Matrix, number[], number[]] {
  let V: Matrix = [];
  let F: Faces = []; // Ensure F is of type Faces, which is [number, number, number][]
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
    F = faces.slice(0, -1); // Ensure F is always an array of [number, number, number]
    edges = edges.slice(0, -4);
  }

  return [V, F, P, edges, corrs];
}

// Cross product function
function cross(v1: Vector3d, v2: Vector3d): Vector3d {
  return [
    v1[1] * v2[2] - v1[2] * v2[1],
    v1[0] * v2[2] - v1[2] * v2[0],
    v1[0] * v2[1] - v1[1] * v2[0]
  ];
}

// UnwarpCylinder function
export function unwarpCylinder(V: Matrix, F: Faces): Matrix {
  const Vuv: Matrix = Array(V.length).fill([0, 0, 0]);
  const flattened: boolean[] = Array(V.length).fill(false);

  // Estimate plane from the first face
  const plane_u: Vector3d = normalize(subtract(V[F[0][1]], V[F[0][0]]));
  const vec2: Vector3d = normalize(subtract(V[F[0][2]], V[F[0][0]]));
  const plane_norm: Vector3d = cross(plane_u, vec2);
  const plane_v: Vector3d = cross(plane_u, plane_norm);

  const l1 = norm(subtract(V[F[0][1]], V[F[0][0]]));
  const l2 = norm(subtract(V[F[0][2]], V[F[0][0]]));

  Vuv[F[0][0]] = [0, 0, 0];
  Vuv[F[0][1]] = [l1, 0, 0];
  Vuv[F[0][2]] = [l2 * dot(vec2, plane_u), l2 * dot(vec2, plane_v), 0];

  flattened[F[0][0]] = true;
  flattened[F[0][1]] = true;
  flattened[F[0][2]] = true;

  // For each subsequent face: project vertices/triangles to that plane
  for (let f = 1; f < F.length; f++) {
    const nflattened = +flattened[F[f][0]] + +flattened[F[f][1]] + +flattened[F[f][2]];

    if (nflattened !== 2) {
      throw new Error('Expected exactly two flattened vertices.');
    }

    let v1 = 0,
      v2 = 1,
      v3 = 2;
    if (!flattened[F[f][1]]) {
      v1 = 1;
      v2 = 0;
      v3 = 2;
    } else if (!flattened[F[f][2]]) {
      v1 = 2;
      v2 = 0;
      v3 = 1;
    }

    let f2_v1 = -1,
      f2;
    for (f2 = 0; f2 < F.length; f2++) {
      if (
        (F[f][v2] === F[f2][0] || F[f][v2] === F[f2][1]) &&
        (F[f][v3] === F[f2][0] || F[f][v3] === F[f2][1])
      ) {
        f2_v1 = 2;
        break;
      } else if (
        (F[f][v2] === F[f2][0] || F[f][v2] === F[f2][2]) &&
        (F[f][v3] === F[f2][0] || F[f][v3] === F[f2][2])
      ) {
        f2_v1 = 1;
        break;
      } else if (
        (F[f][v2] === F[f2][2] || F[f][v2] === F[f2][1]) &&
        (F[f][v3] === F[f2][2] || F[f][v3] === F[f2][1])
      ) {
        f2_v1 = 0;
        break;
      }
    }

    // Flatten the remaining point
    const p1 = V[F[f][v1]];
    const p2 = V[F[f][v2]];
    const p3 = V[F[f][v3]];

    const p2_2d = Vuv[F[f][v2]];
    const p3_2d = Vuv[F[f][v3]];

    const alpha = Math.acos(dot(normalize(subtract(p3, p2)), normalize(subtract(p1, p2))));
    const p12_len = norm(subtract(p1, p2));

    const vref = normalize(subtract(p3_2d, p2_2d));
    const vref_norm: Vector3d = [vref[1], -vref[0], 0];

    let p1_2d: Vector3d = [
      Math.cos(alpha) * vref[0] - Math.sin(alpha) * vref[1],
      Math.sin(alpha) * vref[0] + Math.cos(alpha) * vref[1],
      0
    ];

    let flip = false;
    if (f2_v1 !== -1) {
      const pexst = Vuv[F[f2][f2_v1]];
      if (dot(p1_2d, vref_norm) >= 0 === dot(subtract(pexst, p2_2d), vref_norm) >= 0) {
        flip = true;
      }
    }

    if (flip) {
      p1_2d = [
        Math.cos(-alpha) * vref[0] - Math.sin(-alpha) * vref[1],
        Math.sin(-alpha) * vref[0] + Math.cos(-alpha) * vref[1],
        0
      ];
    }

    flattened[F[f][v1]] = true;
    Vuv[F[f][v1]] = add(scale(p1_2d, p12_len), p2_2d);
  }

  return Vuv;
}

// Helper functions
function subtract(v1: Vector3d, v2: Vector3d): Vector3d {
  return [v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]];
}

function add(v1: Vector3d, v2: Vector3d): Vector3d {
  return [v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]];
}

function scale(v: Vector3d, s: number): Vector3d {
  return [v[0] * s, v[1] * s, v[2] * s];
}

function dot(v1: Vector3d, v2: Vector3d): number {
  return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
}

function norm(v: Vector3d): number {
  return Math.sqrt(dot(v, v));
}

function normalize(v: Vector3d): Vector3d {
  const n = norm(v);
  return [v[0] / n, v[1] / n, v[2] / n];
}
