export interface Vector2 {
  x: number;
  y: number;
}

export interface Wall {
  p1: Vector2;
  p2: Vector2;
}

export interface Guard {
  id: number;
  position: Vector2;
  angle: number; // in radians
  path: Vector2[];
  currentPathIndex: number;
  speed: number;
  viewDistance: number;
  fov: number; // field of view in radians
  color: string;
  waitTime: number; // time to wait at waypoint
  waitTimer: number; // current wait timer
}

export interface Player {
  position: Vector2;
  radius: number;
  speed: number;
}

export interface Level {
  id: number;
  name: string;
  start: Vector2;
  exit: { position: Vector2; radius: number };
  walls: Wall[];
  guards: Omit<Guard, 'waitTimer'>[]; // Initial guard config
}

export enum GameStatus {
  MENU,
  PLAYING,
  GAME_OVER,
  LEVEL_COMPLETE,
  VICTORY
}