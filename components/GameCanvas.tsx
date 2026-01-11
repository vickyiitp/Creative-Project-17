import React, { useRef, useEffect } from 'react';
import { 
  GameStatus, 
  Level, 
  Player, 
  Guard, 
  Vector2 
} from '../types';
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  PLAYER_RADIUS, 
  PLAYER_SPEED, 
  PLAYER_COLOR,
  GUARD_RADIUS,
  GUARD_COLOR,
  GUARD_VISION_COLOR,
  WALL_COLOR,
  WALL_WIDTH,
  EXIT_COLOR,
  BATTERY_MAX,
  BATTERY_DRAIN_RATE,
  BATTERY_RECHARGE_RATE,
  DARKNESS_VISION_MULTIPLIER,
  RAY_COUNT,
} from '../constants';
import { 
  distance, 
  normalize, 
  getRayIntersection, 
  isPointInPolygon, 
  checkCircleCollision 
} from '../utils/geometry';

interface GameCanvasProps {
  level: Level;
  status: GameStatus;
  onStatusChange: (status: GameStatus) => void;
  onBatteryUpdate: (battery: number) => void;
  onDarknessToggle: (isActive: boolean) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  level, 
  status, 
  onStatusChange, 
  onBatteryUpdate,
  onDarknessToggle
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const timeRef = useRef<number>(0);
  
  // Game State Refs (Mutable for performance)
  const playerRef = useRef<Player>({ position: { x: 0, y: 0 }, radius: PLAYER_RADIUS, speed: PLAYER_SPEED });
  const guardsRef = useRef<Guard[]>([]);
  const batteryRef = useRef<number>(BATTERY_MAX);
  const darknessActiveRef = useRef<boolean>(false);
  const keysPressed = useRef<Set<string>>(new Set());

  // Initialize Level
  useEffect(() => {
    playerRef.current.position = { ...level.start };
    guardsRef.current = level.guards.map(g => ({ ...g, waitTimer: 0 }));
    batteryRef.current = BATTERY_MAX;
    darknessActiveRef.current = false;
    onBatteryUpdate(BATTERY_MAX);
    onDarknessToggle(false);
  }, [level]);

  // Input Handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.code);
      if (e.code === 'Space' && status === GameStatus.PLAYING) {
         if (batteryRef.current > 15) { // Hysteresis: Require some charge to start
           darknessActiveRef.current = true;
           onDarknessToggle(true);
         }
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.code);
      if (e.code === 'Space') {
         darknessActiveRef.current = false;
         onDarknessToggle(false);
      }
    };

    const handleVirtualKeyDown = (e: CustomEvent) => {
        const code = e.detail.code;
        keysPressed.current.add(code);
        if (code === 'Space' && status === GameStatus.PLAYING && batteryRef.current > 15) {
            darknessActiveRef.current = true;
            onDarknessToggle(true);
        }
    };

    const handleVirtualKeyUp = (e: CustomEvent) => {
        const code = e.detail.code;
        keysPressed.current.delete(code);
        if (code === 'Space') {
            darknessActiveRef.current = false;
            onDarknessToggle(false);
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    // @ts-ignore
    window.addEventListener('virtual-keydown', handleVirtualKeyDown);
    // @ts-ignore
    window.addEventListener('virtual-keyup', handleVirtualKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      // @ts-ignore
      window.removeEventListener('virtual-keydown', handleVirtualKeyDown);
      // @ts-ignore
      window.removeEventListener('virtual-keyup', handleVirtualKeyUp);
    };
  }, [status, onDarknessToggle]);

  // Main Game Loop
  const update = () => {
    if (status !== GameStatus.PLAYING) return;

    // 1. Handle Battery
    if (darknessActiveRef.current && batteryRef.current > 0) {
      batteryRef.current = Math.max(0, batteryRef.current - BATTERY_DRAIN_RATE);
      if (batteryRef.current <= 0) {
        darknessActiveRef.current = false;
        onDarknessToggle(false);
      }
    } else if (!darknessActiveRef.current && batteryRef.current < BATTERY_MAX) {
      batteryRef.current = Math.min(BATTERY_MAX, batteryRef.current + BATTERY_RECHARGE_RATE);
    }
    onBatteryUpdate(batteryRef.current);

    // 2. Move Player
    const moveVec = { x: 0, y: 0 };
    if (keysPressed.current.has('ArrowUp') || keysPressed.current.has('KeyW')) moveVec.y -= 1;
    if (keysPressed.current.has('ArrowDown') || keysPressed.current.has('KeyS')) moveVec.y += 1;
    if (keysPressed.current.has('ArrowLeft') || keysPressed.current.has('KeyA')) moveVec.x -= 1;
    if (keysPressed.current.has('ArrowRight') || keysPressed.current.has('KeyD')) moveVec.x += 1;

    if (moveVec.x !== 0 || moveVec.y !== 0) {
      const norm = normalize(moveVec);
      let newX = playerRef.current.position.x + norm.x * playerRef.current.speed;
      let newY = playerRef.current.position.y + norm.y * playerRef.current.speed;

      // Basic Wall Collision
      newX = Math.max(PLAYER_RADIUS, Math.min(CANVAS_WIDTH - PLAYER_RADIUS, newX));
      newY = Math.max(PLAYER_RADIUS, Math.min(CANVAS_HEIGHT - PLAYER_RADIUS, newY));
      
      let collided = false;
      for (const wall of level.walls) {
        const l2 = Math.pow(wall.p1.x - wall.p2.x, 2) + Math.pow(wall.p1.y - wall.p2.y, 2);
        if (l2 === 0) continue; 
        let t = ((newX - wall.p1.x) * (wall.p2.x - wall.p1.x) + (newY - wall.p1.y) * (wall.p2.y - wall.p1.y)) / l2;
        t = Math.max(0, Math.min(1, t));
        const projX = wall.p1.x + t * (wall.p2.x - wall.p1.x);
        const projY = wall.p1.y + t * (wall.p2.y - wall.p1.y);
        const distToWall = distance({x: newX, y: newY}, {x: projX, y: projY});
        
        if (distToWall < PLAYER_RADIUS + WALL_WIDTH / 2) {
          collided = true;
          break;
        }
      }

      if (!collided) {
        playerRef.current.position = { x: newX, y: newY };
      }
    }

    // 3. Move Guards
    guardsRef.current.forEach(guard => {
        const target = guard.path[guard.currentPathIndex];
        const dist = distance(guard.position, target);
        
        if (dist < 5) {
            guard.waitTimer++;
            if (guard.waitTimer >= guard.waitTime) {
                guard.waitTimer = 0;
                guard.currentPathIndex = (guard.currentPathIndex + 1) % guard.path.length;
            }
        } else {
            const dir = normalize({ x: target.x - guard.position.x, y: target.y - guard.position.y });
            guard.position.x += dir.x * guard.speed;
            guard.position.y += dir.y * guard.speed;
            guard.angle = Math.atan2(dir.y, dir.x);
        }
    });

    // 4. Check Win Condition
    if (checkCircleCollision(
        playerRef.current.position, 
        playerRef.current.radius, 
        level.exit.position, 
        level.exit.radius
    )) {
      onStatusChange(GameStatus.LEVEL_COMPLETE);
      return;
    }

    // 5. Check Lose Condition (with grace period at start)
    // Only check collision if player has moved or 1 second has passed to prevent instant death on spawn
    if (timeRef.current > 1.0) { 
        for (const guard of guardsRef.current) {
            // Body Collision
            if (checkCircleCollision(
                playerRef.current.position, 
                playerRef.current.radius, 
                guard.position, 
                GUARD_RADIUS
            )) {
                onStatusChange(GameStatus.GAME_OVER);
                return;
            }

            // Vision Collision
            const currentViewDist = darknessActiveRef.current 
                ? guard.viewDistance * DARKNESS_VISION_MULTIPLIER 
                : guard.viewDistance;
            
            const polygonPoints: Vector2[] = [guard.position];
            const angleStep = guard.fov / RAY_COUNT;
            const startAngle = guard.angle - guard.fov / 2;

            for (let i = 0; i <= RAY_COUNT; i++) {
                const angle = startAngle + (angleStep * i);
                const dir = { x: Math.cos(angle), y: Math.sin(angle) };
                
                let closestDist = currentViewDist;
                for (const wall of level.walls) {
                    const dist = getRayIntersection(guard.position, dir, wall);
                    if (dist !== null && dist < closestDist) {
                        closestDist = dist;
                    }
                }

                polygonPoints.push({
                    x: guard.position.x + dir.x * closestDist,
                    y: guard.position.y + dir.y * closestDist
                });
            }

            if (isPointInPolygon(playerRef.current.position, polygonPoints)) {
                onStatusChange(GameStatus.GAME_OVER);
                return;
            }
        }
    }
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Time variable for animations
    timeRef.current += 0.05;
    const pulse = Math.sin(timeRef.current) * 0.5 + 0.5;

    // Clear Screen with Deep Navy (Not Black)
    const bgGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    bgGradient.addColorStop(0, '#050b14');
    bgGradient.addColorStop(1, '#02040a');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Tactical Floor Grid (Lines instead of dots)
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    
    // Grid Lines
    ctx.beginPath();
    for (let x = 0; x <= CANVAS_WIDTH; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
    }
    for (let y = 0; y <= CANVAS_HEIGHT; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
    }
    ctx.stroke();

    // Scanner Bar Effect
    const scanY = (timeRef.current * 100) % (CANVAS_HEIGHT + 200) - 100;
    if (scanY < CANVAS_HEIGHT + 50) {
        const scanGradient = ctx.createLinearGradient(0, scanY, 0, scanY + 50);
        scanGradient.addColorStop(0, 'transparent');
        scanGradient.addColorStop(0.5, 'rgba(0, 240, 255, 0.1)');
        scanGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = scanGradient;
        ctx.fillRect(0, scanY, CANVAS_WIDTH, 50);
        
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
        ctx.beginPath();
        ctx.moveTo(0, scanY + 25);
        ctx.lineTo(CANVAS_WIDTH, scanY + 25);
        ctx.stroke();
    }


    // Draw Exit with Pulse
    const exitGlow = ctx.createRadialGradient(
        level.exit.position.x, level.exit.position.y, 5,
        level.exit.position.x, level.exit.position.y, level.exit.radius + 10 + (pulse * 5)
    );
    exitGlow.addColorStop(0, EXIT_COLOR);
    exitGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = exitGlow;
    ctx.beginPath();
    ctx.arc(level.exit.position.x, level.exit.position.y, level.exit.radius + 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(level.exit.position.x, level.exit.position.y, level.exit.radius * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Draw Walls with Neon Glow
    ctx.strokeStyle = WALL_COLOR;
    ctx.lineWidth = WALL_WIDTH;
    ctx.lineCap = 'square';
    ctx.shadowBlur = 15;
    ctx.shadowColor = WALL_COLOR;
    ctx.beginPath();
    level.walls.forEach(wall => {
      ctx.moveTo(wall.p1.x, wall.p1.y);
      ctx.lineTo(wall.p2.x, wall.p2.y);
    });
    ctx.stroke();
    ctx.shadowBlur = 0; // Reset

    // Draw Guards and Vision
    guardsRef.current.forEach(guard => {
        const currentViewDist = darknessActiveRef.current 
            ? guard.viewDistance * DARKNESS_VISION_MULTIPLIER 
            : guard.viewDistance;

        // Vision Cone Geometry
        const angleStep = guard.fov / RAY_COUNT;
        const startAngle = guard.angle - guard.fov / 2;
        
        ctx.beginPath();
        ctx.moveTo(guard.position.x, guard.position.y);

        for (let i = 0; i <= RAY_COUNT; i++) {
            const angle = startAngle + (angleStep * i);
            const dir = { x: Math.cos(angle), y: Math.sin(angle) };
            let closestDist = currentViewDist;
            for (const wall of level.walls) {
                const dist = getRayIntersection(guard.position, dir, wall);
                if (dist !== null && dist < closestDist) {
                    closestDist = dist;
                }
            }
            ctx.lineTo(
                guard.position.x + dir.x * closestDist,
                guard.position.y + dir.y * closestDist
            );
        }
        ctx.closePath();

        // Fill Vision Cone
        const coneGradient = ctx.createRadialGradient(
            guard.position.x, guard.position.y, 10,
            guard.position.x, guard.position.y, currentViewDist
        );
        coneGradient.addColorStop(0, GUARD_VISION_COLOR);
        coneGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = coneGradient;
        ctx.fill();

        // Draw Radar Sweep Line inside Cone
        const sweepAngle = startAngle + (Math.sin(timeRef.current * 2) + 1) * (guard.fov / 2);
        const sweepDir = { x: Math.cos(sweepAngle), y: Math.sin(sweepAngle) };
        let sweepDist = currentViewDist;
        for (const wall of level.walls) {
             const dist = getRayIntersection(guard.position, sweepDir, wall);
             if (dist !== null && dist < sweepDist) sweepDist = dist;
        }
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(guard.position.x, guard.position.y);
        ctx.lineTo(guard.position.x + sweepDir.x * sweepDist, guard.position.y + sweepDir.y * sweepDist);
        ctx.stroke();

        // Draw Guard Body
        ctx.shadowColor = GUARD_COLOR;
        ctx.shadowBlur = 10;
        ctx.fillStyle = GUARD_COLOR;
        ctx.beginPath();
        ctx.arc(guard.position.x, guard.position.y, GUARD_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    });

    // Draw Player with Pulse
    // Player Glow
    ctx.shadowColor = PLAYER_COLOR;
    ctx.shadowBlur = 20 + (pulse * 10);
    ctx.fillStyle = PLAYER_COLOR;
    ctx.beginPath();
    ctx.arc(playerRef.current.position.x, playerRef.current.position.y, playerRef.current.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Player Core
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(playerRef.current.position.x, playerRef.current.position.y, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Player Ring (Ripple)
    ctx.strokeStyle = `rgba(76, 201, 240, ${1 - pulse})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(playerRef.current.position.x, playerRef.current.position.y, playerRef.current.radius + (pulse * 10), 0, Math.PI * 2);
    ctx.stroke();

    // Darkness Overlay (Vignette style)
    if (darknessActiveRef.current) {
        const gradient = ctx.createRadialGradient(
            playerRef.current.position.x, playerRef.current.position.y, 50,
            playerRef.current.position.x, playerRef.current.position.y, 350
        );
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(0.5, 'rgba(2, 6, 23, 0.7)');
        gradient.addColorStop(1, 'rgba(2, 6, 23, 0.98)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // Add "Stealth Mode" text overlay
        ctx.fillStyle = 'rgba(0, 243, 255, 0.2)';
        ctx.font = '20px Orbitron';
        ctx.fillText("STEALTH ENGAGED", 20, 40);
    }
  };

  const loop = () => {
    update();
    draw();
    requestRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [level, status]);

  return (
    <div className="relative border-4 border-slate-800 rounded-lg shadow-[0_0_80px_rgba(0,243,255,0.15)] overflow-hidden w-full h-full bg-[#050b14]">
        <canvas 
            ref={canvasRef} 
            width={CANVAS_WIDTH} 
            height={CANVAS_HEIGHT} 
            className="block bg-transparent w-full h-full object-contain"
        />
        {/* CRT Scanline Overlay specifically for the canvas */}
        <div className="absolute inset-0 pointer-events-none bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36zwjjgzhhYWGMYAEYB8RmROaABADeOQ8CXl/xfgAAAABJRU5ErkJggg==')] opacity-20"></div>
    </div>
  );
};

export default GameCanvas;