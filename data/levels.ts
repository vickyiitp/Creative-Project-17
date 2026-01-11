import { Level, Vector2 } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, NORMAL_VISION_DISTANCE } from '../constants';

const borderWalls = [
  { p1: { x: 0, y: 0 }, p2: { x: CANVAS_WIDTH, y: 0 } },
  { p1: { x: CANVAS_WIDTH, y: 0 }, p2: { x: CANVAS_WIDTH, y: CANVAS_HEIGHT } },
  { p1: { x: CANVAS_WIDTH, y: CANVAS_HEIGHT }, p2: { x: 0, y: CANVAS_HEIGHT } },
  { p1: { x: 0, y: CANVAS_HEIGHT }, p2: { x: 0, y: 0 } },
];

export const LEVELS: Level[] = [
  {
    id: 1,
    name: "The Infiltration",
    start: { x: 50, y: 50 },
    exit: { position: { x: 750, y: 550 }, radius: 20 },
    walls: [
      ...borderWalls,
      { p1: { x: 200, y: 0 }, p2: { x: 200, y: 400 } },
      { p1: { x: 400, y: 200 }, p2: { x: 400, y: 600 } },
      { p1: { x: 600, y: 0 }, p2: { x: 600, y: 400 } },
    ],
    guards: [
      {
        id: 1,
        position: { x: 300, y: 100 },
        angle: 0,
        path: [{ x: 300, y: 100 }, { x: 300, y: 500 }],
        currentPathIndex: 0,
        speed: 1.5,
        viewDistance: NORMAL_VISION_DISTANCE,
        fov: Math.PI / 3,
        color: 'red',
        waitTime: 60
      },
       {
        id: 2,
        position: { x: 500, y: 500 },
        angle: 0,
        path: [{ x: 500, y: 500 }, { x: 500, y: 100 }],
        currentPathIndex: 0,
        speed: 1.5,
        viewDistance: NORMAL_VISION_DISTANCE,
        fov: Math.PI / 3,
        color: 'red',
        waitTime: 60
      }
    ]
  },
  {
    id: 2,
    name: "Corridors of Silence",
    start: { x: 40, y: 300 },
    exit: { position: { x: 750, y: 300 }, radius: 20 },
    walls: [
      ...borderWalls,
      { p1: { x: 150, y: 150 }, p2: { x: 650, y: 150 } },
      { p1: { x: 150, y: 450 }, p2: { x: 650, y: 450 } },
      { p1: { x: 150, y: 150 }, p2: { x: 150, y: 250 } },
      { p1: { x: 150, y: 450 }, p2: { x: 150, y: 350 } },
      { p1: { x: 650, y: 150 }, p2: { x: 650, y: 250 } },
      { p1: { x: 650, y: 450 }, p2: { x: 650, y: 350 } },
      // Central Block
      { p1: { x: 350, y: 250 }, p2: { x: 450, y: 250 } },
      { p1: { x: 450, y: 250 }, p2: { x: 450, y: 350 } },
      { p1: { x: 450, y: 350 }, p2: { x: 350, y: 350 } },
      { p1: { x: 350, y: 350 }, p2: { x: 350, y: 250 } },
    ],
    guards: [
      {
        id: 1,
        position: { x: 100, y: 100 },
        angle: 0,
        path: [{ x: 100, y: 100 }, { x: 700, y: 100 }],
        currentPathIndex: 0,
        speed: 2,
        viewDistance: NORMAL_VISION_DISTANCE,
        fov: Math.PI / 4,
        color: 'red',
        waitTime: 30
      },
      {
        id: 2,
        position: { x: 700, y: 500 },
        angle: Math.PI,
        path: [{ x: 700, y: 500 }, { x: 100, y: 500 }],
        currentPathIndex: 0,
        speed: 2,
        viewDistance: NORMAL_VISION_DISTANCE,
        fov: Math.PI / 4,
        color: 'red',
        waitTime: 30
      },
       {
        id: 3,
        position: { x: 400, y: 200 },
        angle: Math.PI / 2,
        path: [{ x: 400, y: 200 }, { x: 400, y: 400 }],
        currentPathIndex: 0,
        speed: 1,
        viewDistance: 150,
        fov: Math.PI / 2,
        color: 'red',
        waitTime: 90
      }
    ]
  },
    {
    id: 3,
    name: "The Complex",
    start: { x: 50, y: 550 },
    exit: { position: { x: 750, y: 50 }, radius: 20 },
    walls: [
      ...borderWalls,
      // Zig zag walls
      { p1: { x: 100, y: 600 }, p2: { x: 100, y: 150 } },
      { p1: { x: 250, y: 0 }, p2: { x: 250, y: 450 } },
      { p1: { x: 400, y: 600 }, p2: { x: 400, y: 150 } },
      { p1: { x: 550, y: 0 }, p2: { x: 550, y: 450 } },
      { p1: { x: 700, y: 600 }, p2: { x: 700, y: 200 } },
    ],
    guards: [
      {
        id: 1,
        position: { x: 175, y: 200 },
        angle: 0,
        path: [{ x: 175, y: 200 }, { x: 175, y: 500 }],
        currentPathIndex: 0,
        speed: 1.8,
        viewDistance: NORMAL_VISION_DISTANCE,
        fov: Math.PI / 3,
        color: 'red',
        waitTime: 20
      },
       {
        id: 2,
        position: { x: 325, y: 400 },
        angle: 0,
        path: [{ x: 325, y: 400 }, { x: 325, y: 100 }],
        currentPathIndex: 0,
        speed: 1.8,
        viewDistance: NORMAL_VISION_DISTANCE,
        fov: Math.PI / 3,
        color: 'red',
        waitTime: 20
      },
      {
        id: 3,
        position: { x: 475, y: 200 },
        angle: 0,
        path: [{ x: 475, y: 200 }, { x: 475, y: 500 }],
        currentPathIndex: 0,
        speed: 1.8,
        viewDistance: NORMAL_VISION_DISTANCE,
        fov: Math.PI / 3,
        color: 'red',
        waitTime: 20
      },
       {
        id: 4,
        position: { x: 625, y: 400 },
        angle: 0,
        path: [{ x: 625, y: 400 }, { x: 625, y: 100 }],
        currentPathIndex: 0,
        speed: 1.8,
        viewDistance: NORMAL_VISION_DISTANCE,
        fov: Math.PI / 3,
        color: 'red',
        waitTime: 20
      }
    ]
  }
];