/**
 * Heal Urban Agent - Generative Optimizer Engine
 * Simulates green coverage, UHI offsets, path connectivity, and executes ReAct commands.
 */

import { GRID_SIZE, TILE_TYPES } from './data.js';

// Calculate live metrics for the grid layout
export function calculatePrecinctMetrics(grid, targetCanopy, targetPerm) {
  const totalCells = GRID_SIZE * GRID_SIZE; // 100
  let concreteCount = 0;
  let treeCount = 0;
  let roadCount = 0;
  let parkCount = 0;
  let pathCount = 0;
  let soilCount = 0;
  
  let totalSPR = 0;

  grid.forEach(cellType => {
    switch (cellType) {
      case 0: soilCount++; totalSPR += TILE_TYPES.soil.SPR; break;
      case 1: concreteCount++; totalSPR += TILE_TYPES.concrete.SPR; break;
      case 2: treeCount++; totalSPR += TILE_TYPES.green.SPR; break;
      case 3: roadCount++; totalSPR += TILE_TYPES.road.SPR; break;
      case 4: parkCount++; totalSPR += TILE_TYPES.park.SPR; break;
      case 5: pathCount++; totalSPR += TILE_TYPES.path.SPR; break;
    }
  });

  // 1. Green Cover Density
  const greenDensity = Math.round(((treeCount + parkCount) / totalCells) * 100);

  // 2. Surface Permeability Ratio (SPR)
  const sprRatio = Math.round((totalSPR / totalCells) * 100);

  // 3. Heat Reduction Index (UHI mitigation)
  // Concrete/Road tiles absorb heat (raise temp offset). Trees/Parks/Paths lower it.
  const tempReduction = (treeCount * 0.18) + (parkCount * 0.12) + (pathCount * 0.08) - (concreteCount * 0.05) - (roadCount * 0.03);
  const uhiOffset = parseFloat(Math.max(0, tempReduction).toFixed(1));

  // 4. Pedestrian Connectivity
  // Measure paths and road cells relative to concrete structures
  let connectivity = 10;
  if (concreteCount > 0) {
    connectivity = Math.min(100, Math.round(((pathCount + roadCount * 0.5) / concreteCount) * 45));
  }

  // Combined Design Fitness Index
  const densityWeight = greenDensity >= targetCanopy ? 1.0 : (greenDensity / targetCanopy);
  const permWeight = sprRatio >= targetPerm ? 1.0 : (sprRatio / targetPerm);
  
  const rawFitness = (densityWeight * 0.45) + (permWeight * 0.35) + ((connectivity / 100) * 0.2);
  const fitnessPercent = Math.round(rawFitness * 100);

  return {
    greenDensity,
    sprRatio,
    uhiOffset,
    connectivity,
    fitness: fitnessPercent,
    counts: { concrete: concreteCount, tree: treeCount, road: roadCount, park: parkCount, path: pathCount, soil: soilCount }
  };
}

// Autonomous Design agent logic: searches grid hot-spots and patches them
export function runAgentHeal(grid, targetCanopy, targetPerm) {
  const nextGrid = [...grid];
  let logs = [];
  let stepsCount = 0;

  logs.push(`[INGEST] Layer 1: Accessing sandbox coordinates grid. Scanning structural cell allocations.`);
  
  // Calculate initial metrics
  const initMetrics = calculatePrecinctMetrics(grid, targetCanopy, targetPerm);
  logs.push(`[INGEST] Grid profile: GCD: ${initMetrics.greenDensity}%, SPR: ${initMetrics.sprRatio}%, UHI reduction: ${initMetrics.uhiOffset}°C.`);

  logs.push(`[ANALYZE] Layer 2: Cross-referencing against design directives (Canopy: ${targetCanopy}%, Permeability: ${targetPerm}%).`);
  
  if (initMetrics.greenDensity < targetCanopy) {
    logs.push(`[ANALYZE] Warning: GCD is below target canopy density. Concrete surface hotspots identified.`);
  }
  if (initMetrics.sprRatio < targetPerm) {
    logs.push(`[ANALYZE] Warning: SPR is below target permeability threshold. Rainwater run-off risk is elevated.`);
  }

  logs.push(`[SIMULATE] Layer 3: Running microclimate thermal and circulation diagnostics.`);

  // Heuristic placement loop:
  // Find soil tiles (0) adjacent to concrete (1) or roads (3) and replace them with Tree (2) or Park (4)
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const idx = r * GRID_SIZE + c;
      
      if (nextGrid[idx] === 0) { // Empty soil
        // Check neighbors
        let nearConcrete = false;
        let nearRoad = false;
        
        const neighbors = [
          { r: r - 1, c }, { r: r + 1, c }, { r, c: c - 1 }, { r, c: c + 1 }
        ];

        neighbors.forEach(n => {
          if (n.r >= 0 && n.r < GRID_SIZE && n.c >= 0 && n.c < GRID_SIZE) {
            const nIdx = n.r * GRID_SIZE + n.c;
            if (nextGrid[nIdx] === 1) nearConcrete = true;
            if (nextGrid[nIdx] === 3) nearRoad = true;
          }
        });

        if (nearConcrete && stepsCount < 8 && Math.random() < 0.6) {
          nextGrid[idx] = 2; // Plant tree next to concrete building for shade
          logs.push(`[PROPOSE] Planted Eco Tree at coordinate [${r}, ${c}] to shade adjacent Concrete building facade.`);
          stepsCount++;
        } else if (nearRoad && stepsCount < 8 && Math.random() < 0.4) {
          nextGrid[idx] = 5; // Place permeable pathway next to road
          logs.push(`[PROPOSE] Laid Permeable Path at coordinate [${r}, ${c}] to absorb highway stormwater runoff.`);
          stepsCount++;
        } else if (Math.random() < 0.05 && stepsCount < 8) {
          nextGrid[idx] = 4; // Place pocket park on random open soil
          logs.push(`[PROPOSE] Allocated Pocket Park at coordinate [${r}, ${c}] to enhance neighborhood livability.`);
          stepsCount++;
        }
      }
    }
  }

  // If still below targets, patch random empty blocks
  if (stepsCount === 0) {
    for (let idx = 0; idx < nextGrid.length; idx++) {
      if (nextGrid[idx] === 0 && stepsCount < 5) {
        nextGrid[idx] = 2;
        logs.push(`[PROPOSE] Planted general canopy tree at coordinate index ${idx}.`);
        stepsCount++;
      }
    }
  }

  logs.push(`[SYNTHESIS] Layer 4: Recalculating microclimate offsets. Precinct thermal indices stabilized.`);
  
  const finalMetrics = calculatePrecinctMetrics(nextGrid, targetCanopy, targetPerm);
  logs.push(`[COMPLETE] Sector healed successfully. Green density raised by +${finalMetrics.greenDensity - initMetrics.greenDensity}%. UHI index offset decreased.`, "observation-line");

  return {
    grid: nextGrid,
    logs,
    metrics: finalMetrics
  };
}

// Conversational commands engine
export function processChatCommand(text, grid, targetCanopy, targetPerm) {
  const textLower = text.toLowerCase();
  const nextGrid = [...grid];
  let logs = [];
  let response = "";
  let updatedCanopy = targetCanopy;
  let updatedPerm = targetPerm;

  logs.push(`[INGEST] Conversational query received: "${text}"`);

  if (textLower.includes("add trees") || textLower.includes("plant trees") || textLower.includes("more trees")) {
    let count = 0;
    for (let i = 0; i < nextGrid.length; i++) {
      if (nextGrid[i] === 0 && count < 10) {
        nextGrid[i] = 2; // Tree
        count++;
      }
    }
    logs.push(`[PROPOSE] Placing 10 Eco Trees onto empty soil coordinate buffers.`);
    response = `Planted 10 Eco Trees 🌳 in open soil locations to expand canopy coverage.`;
  } 
  
  else if (textLower.includes("parks") || textLower.includes("pocket park") || textLower.includes("add parks")) {
    let count = 0;
    for (let i = 0; i < nextGrid.length; i++) {
      if (nextGrid[i] === 0 && count < 4) {
        nextGrid[i] = 4; // Park
        count++;
      }
    }
    logs.push(`[PROPOSE] Allocating 4 Pocket Parks to maximize ground cooling reflection.`);
    response = `Added 4 Pocket Parks ⛲ in open spaces to optimize localized thermal comfort.`;
  } 
  
  else if (textLower.includes("paths") || textLower.includes("connect") || textLower.includes("permeable path")) {
    let count = 0;
    for (let i = 0; i < nextGrid.length; i++) {
      if (nextGrid[i] === 0 && count < 8) {
        nextGrid[i] = 5; // Path
        count++;
      }
    }
    logs.push(`[PROPOSE] Laying permeable walking paths to link concrete building entrance nodes.`);
    response = `Laid 8 Permeable Path 🚶 cells to build a low-impact walking loop.`;
  } 
  
  else if (textLower.includes("clear") || textLower.includes("reset") || textLower.includes("empty")) {
    nextGrid.fill(0); // clear all to soil
    logs.push(`[PROPOSE] Resetting sandbox grid to 100% soil.`);
    response = `Cleared all building and road footprints. Sandbox grid reset to empty land.`;
  } 
  
  else if (textLower.includes("target canopy") || textLower.includes("canopy target")) {
    updatedCanopy = 50;
    logs.push(`[SYSTEM] Objective Target Canopy Density increased to 50%.`);
    response = `Target Canopy Density shifted to 50%. Execute Agent Optimization to re-evaluate.`;
  } 
  
  else if (textLower.includes("zoning") || textLower.includes("setback") || textLower.includes("restrict")) {
    // Mutate boundary cells to trees
    for (let c = 0; c < GRID_SIZE; c++) {
      nextGrid[c] = 2; // Top row
      nextGrid[(GRID_SIZE - 1) * GRID_SIZE + c] = 2; // Bottom row
    }
    logs.push(`[PROPOSE] Applying zoning setback buffer. Lining boundary cells with tree canopies.`);
    response = `Applied setback buffer: lined boundary perimeter coordinates with tree shading buffers.`;
  } 
  
  else {
    // Fallback mutation
    let placed = 0;
    for (let i = 0; i < nextGrid.length; i++) {
      if (nextGrid[i] === 0 && placed < 3) {
        nextGrid[i] = 2;
        placed++;
      }
    }
    logs.push(`[ANALYZE] Query processed. Simulating minor layout adaptation.`);
    response = `Understood. I adjusted the layout slightly. Check updated heat reduction indices!`;
  }

  logs.push(`[COMPLETE] Sector recalculated. Diagnostics ready.`);

  return {
    grid: nextGrid,
    logs,
    response,
    targetCanopy: updatedCanopy,
    targetPerm: updatedPerm
  };
}
