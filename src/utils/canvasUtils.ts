export interface CanvasPoint {
  x: number;
  y: number;
  timestamp: number;
}

export interface CanvasStroke {
  points: CanvasPoint[];
  color: string;
  size: number;
  isEraser: boolean;
  glowIntensity: number;
}

export interface SparkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  maxLife: number;
  life: number; // starts at maxLife, decays to 0
}

/**
 * Draws a single stroke on the canvas with multi-pass neon glow.
 */
export function drawStroke(
  ctx: CanvasRenderingContext2D,
  stroke: CanvasStroke,
  fadeAlpha: number = 1.0
) {
  const { points, color, size, isEraser, glowIntensity } = stroke;
  if (points.length < 2) return;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (isEraser) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = 'rgba(0,0,0,1)';
    ctx.lineWidth = size * 2.5;
    ctx.shadowBlur = 0;
    
    drawPath(ctx, points);
  } else {
    ctx.globalCompositeOperation = 'source-over';

    // Pass 1: Outer glow (large blur, thin opacity)
    ctx.shadowColor = color;
    ctx.shadowBlur = glowIntensity * 1.5;
    ctx.strokeStyle = color;
    ctx.lineWidth = size * 1.8;
    ctx.globalAlpha = 0.15 * fadeAlpha;
    drawPath(ctx, points);

    // Pass 2: Medium glow (medium blur, medium opacity)
    ctx.shadowColor = color;
    ctx.shadowBlur = glowIntensity * 0.8;
    ctx.strokeStyle = color;
    ctx.lineWidth = size * 1.2;
    ctx.globalAlpha = 0.45 * fadeAlpha;
    drawPath(ctx, points);

    // Pass 3: Core (white center, solid opacity)
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 4;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = size * 0.4;
    ctx.globalAlpha = 1.0 * fadeAlpha;
    drawPath(ctx, points);
  }

  ctx.restore();
}

/**
 * Helper to draw a quadratic curve path through points.
 */
function drawPath(ctx: CanvasRenderingContext2D, points: CanvasPoint[]) {
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  if (points.length === 2) {
    ctx.lineTo(points[1].x, points[1].y);
    ctx.stroke();
    return;
  }

  for (let i = 1; i < points.length - 1; i++) {
    const xc = (points[i].x + points[i + 1].x) / 2;
    const yc = (points[i].y + points[i + 1].y) / 2;
    ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
  }
  
  ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
  ctx.stroke();
}

/**
 * Creates a burst of spark particles.
 */
export function createSparks(x: number, y: number, color: string, count = 3): SparkParticle[] {
  const sparks: SparkParticle[] = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 2.5 + 0.8;
    const life = Math.random() * 30 + 20; // in frames or ticks
    sparks.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 0.3, // slight upward drift
      color,
      size: Math.random() * 2 + 1.5,
      maxLife: life,
      life,
    });
  }
  return sparks;
}

/**
 * Updates and draws particle sparks.
 */
export function updateAndDrawSparks(
  ctx: CanvasRenderingContext2D,
  sparks: SparkParticle[]
): SparkParticle[] {
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  
  const remainingSparks = sparks.filter((s) => s.life > 0);

  for (const spark of remainingSparks) {
    spark.x += spark.vx;
    spark.y += spark.vy;
    spark.vy += 0.02; // gravity
    spark.life -= 1;

    const alpha = Math.max(0, spark.life / spark.maxLife);
    if (alpha <= 0) continue;

    ctx.shadowColor = spark.color;
    ctx.shadowBlur = 8;
    ctx.fillStyle = spark.color;
    ctx.globalAlpha = alpha;

    ctx.beginPath();
    ctx.arc(spark.x, spark.y, spark.size * alpha, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
  return remainingSparks;
}

/**
 * Draws the finger halo pointer (magnetic cursor).
 */
export function drawCursor(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  size: number
) {
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  
  // Outer glowing halo
  ctx.shadowColor = color;
  ctx.shadowBlur = 20;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.arc(x, y, size + 10, 0, Math.PI * 2);
  ctx.stroke();

  // Inner bright core
  ctx.shadowBlur = 4;
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.4 + 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Saves drawing canvas as PNG.
 * If transparent is false, it puts a solid black background.
 */
export function exportToPNG(
  drawingCanvas: HTMLCanvasElement,
  transparent: boolean,
  filename = 'glow-finger-drawing.png'
) {
  let exportCanvas = drawingCanvas;

  if (!transparent) {
    // Create temporary canvas with black background
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = drawingCanvas.width;
    tempCanvas.height = drawingCanvas.height;
    
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      tempCtx.fillStyle = '#030712'; // dark digital background
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      
      // Draw grid pattern briefly for tech aesthetic
      tempCtx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
      tempCtx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < tempCanvas.width; x += gridSize) {
        tempCtx.beginPath();
        tempCtx.moveTo(x, 0);
        tempCtx.lineTo(x, tempCanvas.height);
        tempCtx.stroke();
      }
      for (let y = 0; y < tempCanvas.height; y += gridSize) {
        tempCtx.beginPath();
        tempCtx.moveTo(0, y);
        tempCtx.lineTo(tempCanvas.width, y);
        tempCtx.stroke();
      }

      tempCtx.drawImage(drawingCanvas, 0, 0);
      exportCanvas = tempCanvas;
    }
  }

  const link = document.createElement('a');
  link.download = filename;
  link.href = exportCanvas.toDataURL('image/png');
  link.click();
}
