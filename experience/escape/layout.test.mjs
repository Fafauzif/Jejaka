import test from 'node:test';
import assert from 'node:assert/strict';
import { LAYOUT, DATA, sourcePixelToWorld, worldToSourcePixel } from './layout.js';

// These are source-coordinate tests. Generated walls, doors and normal-input
// traversal require the independent world/browser checks.
const epsilon = 1e-8;
const cross = (a, b, p) => (b.x - a.x) * (p.z - a.z) - (b.z - a.z) * (p.x - a.x);
function onSegment(a, b, p) {
  return Math.abs(cross(a, b, p)) < epsilon
    && p.x >= Math.min(a.x, b.x) - epsilon && p.x <= Math.max(a.x, b.x) + epsilon
    && p.z >= Math.min(a.z, b.z) - epsilon && p.z <= Math.max(a.z, b.z) + epsilon;
}
function intersects(a, b, c, d) {
  return (cross(a, b, c) * cross(a, b, d) < 0 && cross(c, d, a) * cross(c, d, b) < 0)
    || onSegment(a, b, c) || onSegment(a, b, d) || onSegment(c, d, a) || onSegment(c, d, b);
}
function inside(p, polygon) {
  let result = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i], b = polygon[j];
    if (onSegment(a, b, p)) return true;
    if ((a.z > p.z) !== (b.z > p.z)
      && p.x < (b.x - a.x) * (p.z - a.z) / (b.z - a.z) + a.x) result = !result;
  }
  return result;
}
function pointDistance(p, a, b) {
  const x = b.x - a.x, z = b.z - a.z, lengthSquared = x * x + z * z;
  const t = lengthSquared ? Math.max(0, Math.min(1, ((p.x - a.x) * x + (p.z - a.z) * z) / lengthSquared)) : 0;
  return Math.hypot(p.x - a.x - x * t, p.z - a.z - z * t);
}
function segmentDistance(a, b, c, d) {
  return intersects(a, b, c, d) ? 0 : Math.min(
    pointDistance(a, c, d), pointDistance(b, c, d), pointDistance(c, a, b), pointDistance(d, a, b),
  );
}
function footprintConflicts(route, radius = 0.24) {
  const conflicts = [];
  for (let i = 1; i < route.length; i++) {
    const a = route[i - 1], b = route[i];
    for (const footprint of DATA.footprints) {
      // This is the authored entrance into the actual school footprint.
      if (footprint.id === 'F_SCHOOL_63' && a.id === 'refugeApproach' && b.id === 'refuge') continue;
      let blocked = inside(a, footprint.points) || inside(b, footprint.points);
      for (let edge = 0; edge < footprint.points.length; edge++) {
        blocked ||= segmentDistance(a, b, footprint.points[edge], footprint.points[(edge + 1) % footprint.points.length]) < radius;
      }
      if (blocked) conflicts.push({ from: a.id, to: b.id, footprint: footprint.id });
    }
  }
  return conflicts;
}

// Split each route segment at every polygon-edge intersection, then classify
// each open interval. Counting the resulting water runs concerns this route,
// not the number of bridges in Surabaya.
function crossedWaterRuns(route, polygon) {
  let runs = 0, previouslyWet = false;
  for (let index = 1; index < route.length; index++) {
    const a = route[index - 1], b = route[index], dx = b.x - a.x, dz = b.z - a.z;
    const splits = [0, 1];
    for (let edge = 0; edge < polygon.length; edge++) {
      const c = polygon[edge], d = polygon[(edge + 1) % polygon.length];
      const ex = d.x - c.x, ez = d.z - c.z, denominator = dx * ez - dz * ex;
      if (Math.abs(denominator) < epsilon) continue;
      const cx = c.x - a.x, cz = c.z - a.z;
      const t = (cx * ez - cz * ex) / denominator, u = (cx * dz - cz * dx) / denominator;
      if (t > epsilon && t < 1 - epsilon && u >= -epsilon && u <= 1 + epsilon) splits.push(t);
    }
    splits.sort((x, y) => x - y);
    for (let i = 1; i < splits.length; i++) {
      if (splits[i] - splits[i - 1] < epsilon) continue;
      const t = (splits[i] + splits[i - 1]) / 2;
      const wet = inside({ x: a.x + dx * t, z: a.z + dz * t }, polygon);
      if (wet && !previouslyWet) runs++;
      previouslyWet = wet;
    }
  }
  return runs;
}

test('map frame keeps north on the right when facing west and supports inverse coordinates', () => {
  const origin = sourcePixelToWorld(3050, 4330);
  const east = sourcePixelToWorld(3051, 4330), north = sourcePixelToWorld(3050, 4329);
  const westFacing = { x: origin.x - east.x, z: origin.z - east.z };
  const right = { x: -westFacing.z, z: westFacing.x };
  assert((north.x - origin.x) * right.x + (north.z - origin.z) * right.z > 0,
    'Exchanging the axes without the sign correction mirrors the map');
  for (const pixels of [[2460, 3700], [3720, 4960], [3050, 4330], [3095, 4330], ...LAYOUT.actorRoute.map(p => p.sourcePixels)]) {
    const world = sourcePixelToWorld(...pixels), restored = worldToSourcePixel(world.x, world.z);
    assert(Math.hypot(restored.u - pixels[0], restored.v - pixels[1]) < 1e-5);
  }
});

test('school access avoids mapped masses; the rejected source route intersects buildings 62 and 81', () => {
  const rejected = LAYOUT.actorRoute.map(p => ({ ...p }));
  Object.assign(rejected.find(p => p.id === 'connectorWest'), sourcePixelToWorld(2950, 4680));
  Object.assign(rejected.find(p => p.id === 'schoolApproach'), sourcePixelToWorld(2953, 4798));
  const oldConflicts = footprintConflicts(rejected);
  assert(oldConflicts.some(p => p.footprint === 'F_TRADING_62'), 'Retain the actual trading-building failure');
  assert(oldConflicts.some(p => p.footprint === 'F_CHURCH_81'), 'Retain the actual church failure');
  assert.deepEqual(footprintConflicts(LAYOUT.actorRoute), [],
    'Check complete segments and body clearance, not only the waypoint centres');
});

test('map identities remain distinct and the played route crosses Kali Mas once', () => {
  const school = DATA.footprints.find(p => p.id === 'F_SCHOOL_63');
  const church = DATA.footprints.find(p => p.id === 'F_CHURCH_81');
  const pwd = DATA.footprints.find(p => p.id === 'F_PWD_1');
  assert.equal(LAYOUT.school.mapIndex, 63);
  assert.match(school.label, /Juliana School/);
  assert.match(church.label, /index81: R\.C\.Church/);
  assert.match(pwd.label, /P\.W\.D\. Offices/);
  assert.doesNotMatch(pwd.label, /Internatio/);
  assert.notDeepEqual(school.sourcePixels, church.sourcePixels);
  assert.notDeepEqual(school.sourcePixels, pwd.sourcePixels);
  const kaliMas = DATA.waters.find(p => p.id === 'W_KALIMAS');
  assert.equal(crossedWaterRuns(LAYOUT.actorRoute, kaliMas.points), 1,
    'One playable crossing is a statement about this route, not the whole city');
  assert.deepEqual(LAYOUT.crossing.east, sourcePixelToWorld(3095, 4330));
  assert.deepEqual(LAYOUT.crossing.west, sourcePixelToWorld(3050, 4330));
});
