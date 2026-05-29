/**
 * Heal Urban Agent - Visualizer Canvas Renderer
 * Renders 2D top-down grid and 2.5D isometric structures with thermal overlays.
 */

import { GRID_SIZE, TILE_TYPES } from './data.js';

let windOffset = 0;
let animFrameId = null;

// Convert grid (col, row, zHeight) to Screen coords for 2.5D Isometric
function toIso(col, row, z = 0, width, height, is2D = false) {
  if (is2D) {
    const cellSize = Math.min(width, height) * 0.9 / GRID_SIZE;
    const offsetX = (width - GRID_SIZE * cellSize) / 2;
    const offsetY = (height - GRID_SIZE * cellSize) / 2;
    return {
      x: offsetX + col * cellSize,
      y: offsetY + row * cellSize,
      w: cellSize,
      h: cellSize
    };
  } else {
    // 2.5D Iso constants
    const cellW = 36;
    const cellH = 18;
    const offsetX = width / 2;
    const offsetY = height / 2 - 80;
    
    // Grid centering
    const gridOffsetCol = col - GRID_SIZE / 2;
    const gridOffsetRow = row - GRID_SIZE / 2;

    return {
      x: offsetX + (gridOffsetCol - gridOffsetRow) * cellW,
      y: offsetY + (gridOffsetCol + gridOffsetRow) * cellH - z
    };
  }
}

// Check mouse hover tile index
export function getTileIndexAtPoint(px, py, width, height, is2D) {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (is2D) {
        const coords = toIso(c, r, 0, width, height, true);
        if (px >= coords.x && px <= coords.x + coords.w && py >= coords.y && py <= coords.y + coords.h) {
          return r * GRID_SIZE + c;
        }
      } else {
        const coords = toIso(c, r, 0, width, height, false);
        // Approx distance check to diamond center
        const dx = Math.abs(px - coords.x);
        const dy = Math.abs(py - (coords.y + 9));
        if (dx / 36 + dy / 18 <= 1.0) {
          return r * GRID_SIZE + c;
        }
      }
    }
  }
  return null;
}

// Master Sandbox Render
export function drawSandbox(canvas, grid, overlayMode, is2D, mousePos = null, hoveredIdx = null) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width = canvas.parentElement.clientWidth;
  const h = canvas.height = canvas.parentElement.clientHeight;

  if (animFrameId) cancelAnimationFrame(animFrameId);

  // Dark background
  ctx.fillStyle = '#12141c';
  ctx.fillRect(0, 0, w, h);

  // 1. Draw Grid Cells & Land Base
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const idx = r * GRID_SIZE + c;
      const type = grid[idx];
      const isHover = hoveredIdx === idx;

      if (is2D) {
        // 2D Square
        const coords = toIso(c, r, 0, w, h, true);
        
        // Base fill
        ctx.fillStyle = get2DColor(type);
        ctx.fillRect(coords.x, coords.y, coords.w, coords.h);
        
        // Border
        ctx.strokeStyle = isHover ? '#4ade80' : 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = isHover ? 2 : 1;
        ctx.strokeRect(coords.x, coords.y, coords.w, coords.h);

        // Emoji overlay
        drawEmoji(ctx, type, coords.x + coords.w/2, coords.y + coords.h/2, coords.w * 0.5);
      } else {
        // 2.5D Isometric Diamond
        const cellW = 36;
        const cellH = 18;
        const coords = toIso(c, r, 0, w, h, false);

        // Draw diamond shape
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
        ctx.lineTo(coords.x + cellW, coords.y + cellH);
        ctx.lineTo(coords.x, coords.y + cellH * 2);
        ctx.lineTo(coords.x - cellW, coords.y + cellH);
        ctx.closePath();

        ctx.fillStyle = get2DColor(type);
        ctx.fill();

        ctx.strokeStyle = isHover ? '#4ade80' : 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = isHover ? 1.5 : 1;
        ctx.stroke();

        // If Concrete Building (1), draw rising tower block
        if (type === 1) {
          drawBuilding3D(ctx, coords, cellW, cellH, 35, isHover);
        }
        // If Eco Tree (2), draw 3D Sphere canopy
        else if (type === 2) {
          drawTree3D(ctx, coords, cellW, cellH, 20);
        }
        // If Pocket Park (4), draw small bench/hedge elements
        else if (type === 4) {
          drawPark3D(ctx, coords, cellW, cellH);
        }
        // Emojis for other types (roads, paths)
        else if (type === 3 || type === 5) {
          drawEmoji(ctx, type, coords.x, coords.y + cellH, 14);
        }
      }
    }
  }

  // 2. Heatmap overlay (UHI thermal gradients)
  if (overlayMode === 'solar') {
    drawUHIHeatmap(ctx, grid, w, h, is2D);
  }

  // 3. Wind currents animation
  if (overlayMode === 'wind') {
    drawWindStreams(ctx, grid, w, h, is2D);
  }

  windOffset += 0.8;

  if (overlayMode === 'wind') {
    animFrameId = requestAnimationFrame(() => drawSandbox(canvas, grid, overlayMode, is2D, mousePos, hoveredIdx));
  }
}

// 2D cell colors
function get2DColor(type) {
  switch (type) {
    case 1: return 'rgba(30, 41, 59, 0.7)'; // Concrete Building
    case 2: return 'rgba(74, 222, 128, 0.15)'; // Eco Tree
    case 3: return 'rgba(15, 23, 42, 0.9)'; // Asphalt Road
    case 4: return 'rgba(16, 185, 129, 0.2)'; // Pocket Park
    case 5: return 'rgba(20, 184, 166, 0.15)'; // Permeable Path
    default: return 'rgba(255, 255, 255, 0.015)'; // Soil
  }
}

function drawEmoji(ctx, type, x, y, size) {
  ctx.save();
  ctx.font = `${size}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  let emoji = "";
  if (type === 1) emoji = "🏢";
  else if (type === 2) emoji = "🌳";
  else if (type === 3) emoji = "🛣️";
  else if (type === 4) emoji = "⛲";
  else if (type === 5) emoji = "🚶";

  if (emoji !== "") {
    ctx.fillText(emoji, x, y);
  }
  ctx.restore();
}

// Render 2.5D Building Blocks
function drawBuilding3D(ctx, baseCoords, cellW, cellH, height, isHover) {
  const tL = { x: baseCoords.x - cellW, y: baseCoords.y + cellH - height };
  const tC = { x: baseCoords.x, y: baseCoords.y - height };
  const tR = { x: baseCoords.x + cellW, y: baseCoords.y + cellH - height };
  const tB = { x: baseCoords.x, y: baseCoords.y + cellH * 2 - height };

  // Left side
  ctx.fillStyle = 'rgba(51, 65, 85, 0.75)';
  ctx.beginPath();
  ctx.moveTo(baseCoords.x - cellW, baseCoords.y + cellH);
  ctx.lineTo(baseCoords.x, baseCoords.y + cellH * 2);
  ctx.lineTo(tB.x, tB.y);
  ctx.lineTo(tL.x, tL.y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = isHover ? '#4ade80' : 'rgba(255,255,255,0.06)';
  ctx.stroke();

  // Right side
  ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
  ctx.beginPath();
  ctx.moveTo(baseCoords.x, baseCoords.y + cellH * 2);
  ctx.lineTo(baseCoords.x + cellW, baseCoords.y + cellH);
  ctx.lineTo(tR.x, tR.y);
  ctx.lineTo(tB.x, tB.y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Top roof face
  ctx.fillStyle = 'rgba(71, 85, 105, 0.9)';
  ctx.beginPath();
  ctx.moveTo(tL.x, tL.y);
  ctx.lineTo(tC.x, tC.y);
  ctx.lineTo(tR.x, tR.y);
  ctx.lineTo(tB.x, tB.y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

// Render 2.5D Tree model
function drawTree3D(ctx, baseCoords, cellW, cellH, height) {
  const trunkX = baseCoords.x;
  const trunkY = baseCoords.y + cellH;
  
  // Trunk line
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(trunkX, trunkY);
  ctx.lineTo(trunkX, trunkY - height);
  ctx.stroke();

  // Foliage green sphere
  ctx.shadowColor = 'rgba(74, 222, 128, 0.3)';
  ctx.shadowBlur = 10;
  
  const rad = ctx.createRadialGradient(trunkX - 3, trunkY - height - 3, 2, trunkX, trunkY - height, 12);
  rad.addColorStop(0, '#86efac');
  rad.addColorStop(1, '#15803d');
  
  ctx.fillStyle = rad;
  ctx.beginPath();
  ctx.arc(trunkX, trunkY - height, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0; // reset
}

// Render 2.5D Park detail
function drawPark3D(ctx, baseCoords, cellW, cellH) {
  // Draw green bushes inside diamond
  ctx.fillStyle = '#166534';
  ctx.beginPath();
  ctx.arc(baseCoords.x - 10, baseCoords.y + cellH, 4, 0, Math.PI*2);
  ctx.arc(baseCoords.x + 10, baseCoords.y + cellH, 4, 0, Math.PI*2);
  ctx.arc(baseCoords.x, baseCoords.y + cellH - 4, 5, 0, Math.PI*2);
  ctx.fill();

  // Fountain center dot
  ctx.fillStyle = '#60a5fa';
  ctx.beginPath();
  ctx.arc(baseCoords.x, baseCoords.y + cellH + 4, 2.5, 0, Math.PI*2);
  ctx.fill();
}

// Draw UHI Heatmap overlays
function drawUHIHeatmap(ctx, grid, width, height, is2D) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const idx = r * GRID_SIZE + c;
      const type = grid[idx];
      const coords = toIso(c, r, 0, width, height, is2D);
      const px = is2D ? coords.x + coords.w/2 : coords.x;
      const py = is2D ? coords.y + coords.h/2 : coords.y + 9;

      let radius = is2D ? coords.w * 1.8 : 45;
      let grad = ctx.createRadialGradient(px, py, 2, px, py, radius);

      if (type === 1 || type === 3) {
        // Hotspot (red/orange)
        grad.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
        grad.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(px, py, radius, 0, Math.PI*2); ctx.fill();
      } else if (type === 2 || type === 4) {
        // Cooling buffer (blue/cyan)
        grad.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
        grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(px, py, radius, 0, Math.PI*2); ctx.fill();
      }
    }
  }
  ctx.restore();
}

// Wind currents
function drawWindStreams(ctx, grid, width, height, is2D) {
  ctx.save();
  ctx.strokeStyle = 'rgba(74, 222, 128, 0.2)';
  ctx.lineWidth = 1.2;
  
  const step = 45;
  const maxLimit = Math.max(width, height) * 1.5;
  const angle = Math.PI * 0.25; // Wind blows SW-NE

  for (let offset = -maxLimit; offset < maxLimit; offset += step) {
    ctx.beginPath();
    for (let pathStep = 0; pathStep < 200; pathStep += 15) {
      const progress = pathStep + (windOffset * 6) % 150;
      const px = progress * Math.cos(angle) + offset * Math.sin(angle);
      const py = progress * Math.sin(angle) + offset * Math.cos(angle);
      
      if (px >= 0 && px <= width && py >= 0 && py <= height) {
        // Draw small wind current lines
        ctx.fillStyle = 'rgba(74, 222, 128, 0.35)';
        ctx.fillRect(px, py, 1.5, 1.5);
      }
    }
  }
  ctx.restore();
}
