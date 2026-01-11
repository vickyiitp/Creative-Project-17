import { Vector2, Wall } from '../types';

export const distance = (v1: Vector2, v2: Vector2): number => {
  return Math.sqrt(Math.pow(v2.x - v1.x, 2) + Math.pow(v2.y - v1.y, 2));
};

export const normalize = (v: Vector2): Vector2 => {
  const d = Math.sqrt(v.x * v.x + v.y * v.y);
  return d === 0 ? { x: 0, y: 0 } : { x: v.x / d, y: v.y / d };
};

// Ray-Line Segment Intersection
// Returns distance from ray origin to intersection, or null if no intersection
export const getRayIntersection = (
  rayOrigin: Vector2,
  rayDir: Vector2,
  segment: Wall
): number | null => {
  const x1 = segment.p1.x;
  const y1 = segment.p1.y;
  const x2 = segment.p2.x;
  const y2 = segment.p2.y;

  const x3 = rayOrigin.x;
  const y3 = rayOrigin.y;
  const x4 = rayOrigin.x + rayDir.x;
  const y4 = rayOrigin.y + rayDir.y;

  const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (den === 0) return null;

  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;

  if (t >= 0 && t <= 1 && u > 0) {
    const ptX = x1 + t * (x2 - x1);
    const ptY = y1 + t * (y2 - y1);
    return distance(rayOrigin, { x: ptX, y: ptY });
  }

  return null;
};

// Check if a point is inside a polygon using Ray Casting (Even-Odd Rule)
export const isPointInPolygon = (point: Vector2, polygon: Vector2[]): boolean => {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;

    const intersect = ((yi > point.y) !== (yj > point.y))
        && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
};

// Circle-Circle collision
export const checkCircleCollision = (p1: Vector2, r1: number, p2: Vector2, r2: number): boolean => {
  const dist = distance(p1, p2);
  return dist < (r1 + r2);
};