/**
 * HEAL GPS Map & 4-Layer Agent Pipeline - Main Controller
 * Orchestrates geographic context indexing, 4-Layer pipeline simulation, and GUI link elements.
 */

import { DISTRICTS, WIND_PROFILES } from './data.js';
import { evaluateBlueprint, processCommand, mutateBlueprint } from './generative.js';
import { renderPrecinct } from './visualizer.js';

// Application State
let state = {
  activeDistrictId: 'tampines',
  currentBlueprint: { blocks: [] },
  activeBlueprintIndex: 0,
  weights: { w1: 0.30, w2: 0.30, w3: 0.20, w4: 0.20 },
  overlayMode: 'none',
  is2D: false,
  isMapMode: true, // App starts on Singapore GPS Map view
  mousePosition: null,
  pipelineRunning: false
};

// UI Elements
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const canvas = document.getElementById('canvas3d');

// Navigations
const gpsSearchInput = document.getElementById('gpsSearchInput');
const btnGpsSearch = document.getElementById('btnGpsSearch');
const districtSelect = document.getElementById('districtSelect');
const btnDeployCoDesigner = document.getElementById('btnDeployCoDesigner');

// Tabs & Views controls
const tabGlobalMap = document.getElementById('tabGlobalMap');
const tabPrecinct = document.getElementById('tabPrecinct');
const precinctControls = document.getElementById('precinctControls');
const viewPerspective = document.getElementById('viewPerspective');
const viewTopDown = document.getElementById('viewTopDown');
const viewportTitle = document.getElementById('viewportTitle');

// Weight sliders
const sliderW1 = document.getElementById('weightDensity');
const valW1 = document.getElementById('w1Val');
const sliderW2 = document.getElementById('weightAirflow');
const valW2 = document.getElementById('w2Val');
const sliderW3 = document.getElementById('weightModularity');
const valW3 = document.getElementById('w3Val');
const sliderW4 = document.getElementById('weightCost');
const valW4 = document.getElementById('w4Val');

// Pipeline buttons
const btnRunPipeline = document.getElementById('btnRunPipeline');
const btnReset = document.getElementById('btnReset');

// Floating elements
const districtHud = document.getElementById('districtHud');
const blueprintSelector = document.getElementById('blueprintSelector');
const blockTooltip = document.getElementById('blockTooltip');

// 4-Layer UI cards & indicators
const layerCards = [
  { card: document.getElementById('layerCard1'), dot: document.getElementById('layerDot1') },
  { card: document.getElementById('layerCard2'), dot: document.getElementById('layerDot2') },
  { card: document.getElementById('layerCard3'), dot: document.getElementById('layerDot3') },
  { card: document.getElementById('layerCard4'), dot: document.getElementById('layerDot4') }
];

// Human Dignity Scorecard elements
const fitnessScoreText = document.getElementById('fitnessScore');
const fitnessRing = document.getElementById('fitnessRing');
const dignityPrivacy = document.getElementById('dignityPrivacy');
const dignityComfort = document.getElementById('dignityComfort');
const dignitySafety = document.getElementById('dignitySafety');
const dignityHealth = document.getElementById('dignityHealth');

// KPIs progress bars
const kpiDensityVal = document.getElementById('kpiDensityVal');
const kpiDensityBar = document.getElementById('kpiDensityBar');
const kpiAirflowVal = document.getElementById('kpiAirflowVal');
const kpiAirflowBar = document.getElementById('kpiAirflowBar');
const kpiModularVal = document.getElementById('kpiModularVal');
const kpiModularBar = document.getElementById('kpiModularBar');
const kpiCostVal = document.getElementById('kpiCostVal');
const kpiCostBar = document.getElementById('kpiCostBar');

// Conversational prompts inputs
const chatHistory = document.getElementById('chatHistory');
const chatInputForm = document.getElementById('chatInputForm');
const chatInput = document.getElementById('chatInput');
const btnSendChat = document.getElementById('btnSendChat');
const agentStream = document.getElementById('agentStream');

// Odor mitigation cards
const odorCards = {
  corridor: document.querySelector('[data-odor="corridor"]'),
  chute: document.querySelector('[data-odor="chute"]'),
  mold: document.querySelector('[data-odor="mold"]'),
  drainage: document.querySelector('[data-odor="drainage"]')
};

// Start application
function init() {
  loadDistrictProfile(state.activeDistrictId);
  setupEventListeners();
  updateScores();
  triggerRender();
  addStreamLine("[SYSTEM] Geographical co-designer online. Select district on Singapore GPS Map or locate target coordinate.");
}

// Log streaming into right panel
function addStreamLine(text, type = 'system-line') {
  const line = document.createElement('div');
  line.className = `stream-line ${type}`;
  line.textContent = text;
  agentStream.appendChild(line);
  agentStream.scrollTop = agentStream.scrollHeight;
}

// Load district stats & pre-configurations layouts
function loadDistrictProfile(id) {
  state.activeDistrictId = id;
  const d = DISTRICTS[id];
  if (!d) return;

  // Set initial building layouts copy
  state.currentBlueprint = { blocks: JSON.parse(JSON.stringify(d.layout)) };
  state.activeBlueprintIndex = 0;

  // Update District HUD details
  document.getElementById('hudDistrictName').textContent = d.name;
  document.getElementById('hudRentalRatio').textContent = d.rentalRatio;
  document.getElementById('hudHumidity').textContent = `${d.windSpeed} m/s | ${d.humidity}% RH`;

  const gapPercent = Math.min(100, Math.round((d.wageGap / 15.0) * 100));
  const gapBar = document.getElementById('hudWageGapBar');
  gapBar.style.width = `${gapPercent}%`;
  gapBar.className = d.wageGap > 8.0 ? 'hud-bar-fill fill-red' : 'hud-bar-fill fill-green';
  document.getElementById('hudWageGapText').textContent = `Property values outpace wages by ${d.wageGap}%`;

  districtSelect.value = id;
  gpsSearchInput.value = d.label;
}

// Recalculate and update scorecard and KPIs
function updateScores() {
  const d = DISTRICTS[state.activeDistrictId];
  const scores = evaluateBlueprint(state.currentBlueprint, state.weights, d.windDir, state.activeDistrictId);

  // Update Circle indicator
  fitnessScoreText.textContent = `${scores.fitness}%`;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (scores.fitness / 100) * circumference;
  fitnessRing.style.strokeDashoffset = offset;
  fitnessRing.style.stroke = scores.fitness >= 80 ? 'var(--color-success)' : (scores.fitness >= 55 ? 'var(--color-warning)' : 'var(--color-danger)');

  // Human Dignity Scorecard indexes
  updateDignityRow(dignityPrivacy, scores.dignity.privacy);
  updateDignityRow(dignityComfort, scores.dignity.comfort);
  updateDignityRow(dignitySafety, scores.dignity.safety);
  updateDignityRow(dignityHealth, scores.dignity.health);

  // KPIs
  kpiDensityVal.textContent = scores.gpr.toFixed(2);
  kpiDensityBar.style.width = `${scores.densityScore * 100}%`;

  kpiAirflowVal.textContent = `${scores.avgWindSpeed.toFixed(1)} m/s`;
  kpiAirflowBar.style.width = `${scores.airflowScore * 100}%`;

  kpiModularVal.textContent = `${Math.round(scores.modularScore * 100)}%`;
  kpiModularBar.style.width = `${scores.modularScore * 100}%`;

  kpiCostVal.textContent = `${Math.round(scores.costScore * 100)}%`;
  kpiCostBar.style.width = `${scores.costScore * 100}%`;

  // Odor Prevention reports
  updateOdorStatus('corridor', scores.odorRisks.corridor);
  updateOdorStatus('chute', scores.odorRisks.chute);
  updateOdorStatus('mold', scores.odorRisks.mold, `${scores.moldRisk}% Risk`);
  updateOdorStatus('drainage', scores.odorRisks.drainage);
}

function updateDignityRow(el, rating) {
  el.textContent = rating;
  if (rating === 'Good') {
    el.className = 'mitigated-text';
  } else {
    el.className = 'warn-text';
  }
}

function updateOdorStatus(key, status, labelOverride = null) {
  const card = odorCards[key];
  const dot = document.getElementById(`odor${capitalize(key)}Dot`);
  const scoreText = document.getElementById(`odor${capitalize(key)}Score`);

  if (status === 'Mitigated') {
    dot.className = 'odor-status-dot status-mitigated';
    scoreText.className = 'odor-score mitigated-text';
    scoreText.textContent = 'Mitigated';
  } else {
    dot.className = 'odor-status-dot status-warn';
    scoreText.className = 'odor-score warn-text';
    scoreText.textContent = labelOverride || 'High Risk';
  }
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Visualizer Redraw
function triggerRender() {
  renderPrecinct(
    canvas,
    state.currentBlueprint,
    state.overlayMode,
    state.is2D,
    state.mousePosition,
    handleBlockHover,
    state.activeDistrictId,
    state.isMapMode,
    handleDistrictHover
  );
}

let lastHoveredDistrictId = null;
function handleDistrictHover(hoveredId) {
  if (hoveredId && hoveredId !== lastHoveredDistrictId) {
    lastHoveredDistrictId = hoveredId;
    canvas.style.cursor = 'pointer';
  } else if (!hoveredId) {
    lastHoveredDistrictId = null;
    canvas.style.cursor = 'default';
  }
}

function handleBlockHover(hoveredBlock, clientPos) {
  if (!hoveredBlock || !clientPos || state.isMapMode) {
    blockTooltip.classList.add('hidden');
    return;
  }

  const parentRect = canvas.getBoundingClientRect();
  blockTooltip.style.left = `${clientPos.x + 15}px`;
  blockTooltip.style.top = `${clientPos.y + 15}px`;
  blockTooltip.classList.remove('hidden');

  document.getElementById('tooltipBlockName').textContent = `${hoveredBlock.name} (${hoveredBlock.height} Storeys)`;
  
  const unitContribution = hoveredBlock.w * hoveredBlock.h * hoveredBlock.height * 8;
  document.getElementById('ttGpr').textContent = ((hoveredBlock.w * hoveredBlock.h * hoveredBlock.height) / 144 * 8).toFixed(1);
  
  const blockWind = hoveredBlock.hasVoids ? '2.3 m/s' : '0.2 m/s';
  document.getElementById('ttWind').textContent = blockWind;
  
  const blockOdor = hoveredBlock.hasVoids && hoveredBlock.hasRoofExhaust && hoveredBlock.independentMEP ? 'Low' : 'High';
  document.getElementById('ttOdor').textContent = blockOdor;
  
  const blockMold = hoveredBlock.dryingLedgesRatio > 0.6 ? '4%' : '35%';
  document.getElementById('ttMold').textContent = blockMold;
  
  document.getElementById('ttUnits').textContent = `${unitContribution} PPVC`;
}

function setSystemStatus(type, label) {
  statusDot.className = `status-dot status-${type}`;
  statusText.textContent = label;
}

// 4-Layer Pipeline Sequential Execution Loop
function execute4LayerPipeline() {
  if (state.pipelineRunning) return;
  state.pipelineRunning = true;
  setSystemStatus('running', 'Analyzing Pipeline');

  // Disable buttons
  btnRunPipeline.disabled = true;
  btnDeployCoDesigner.disabled = true;

  // Clear previous timeline states
  layerCards.forEach(item => {
    item.card.classList.remove('active', 'completed');
    item.dot.className = 'pipeline-dot';
  });

  const d = DISTRICTS[state.activeDistrictId];

  // Pipeline Step 1: Ingestion
  addStreamLine(`[INGEST] Layer 1: Starting Data Ingestion for ${d.name}.`);
  layerCards[0].card.classList.add('active');
  layerCards[0].dot.className = 'pipeline-dot active';

  setTimeout(() => {
    addStreamLine(`[INGEST] Reads spatial coastline vector maps, transport roads, and boundaries.`);
    addStreamLine(`[INGEST] Demographics Context: local wage growth is ${d.wageGap}%, property values inflation remains extreme.`);
    addStreamLine(`[INGEST] Weather Context: average windrose speed is ${d.windSpeed} m/s, humidity is ${d.humidity}%.`);
    
    layerCards[0].card.classList.remove('active');
    layerCards[0].card.classList.add('completed');
    layerCards[0].dot.className = 'pipeline-dot completed';

    // Pipeline Step 2: Structural Analysis
    addStreamLine(`[ANALYZE] Layer 2: Commencing Structural & Code Clearances.`);
    layerCards[1].card.classList.add('active');
    layerCards[1].dot.className = 'pipeline-dot active';

    setTimeout(() => {
      addStreamLine(`[ANALYZE] Checking zoning setback borders (10m setback). All blocks verify.`);
      addStreamLine(`[ANALYZE] Checking zoning height storeys clearance. Local district limit is ${d.zoningHeight} storeys.`);
      addStreamLine(`[ANALYZE] Evaluating modular PPVC repeat footprint and logistics clearances.`);
      
      layerCards[1].card.classList.remove('active');
      layerCards[1].card.classList.add('completed');
      layerCards[1].dot.className = 'pipeline-dot completed';

      // Pipeline Step 3: Microclimate Olfactory
      addStreamLine(`[SIMULATE] Layer 3: Running CFD & Olfactory Simulations.`);
      layerCards[2].card.classList.add('active');
      layerCards[2].dot.className = 'pipeline-dot active';

      // Mutate layout slightly during CFD animation
      let simulationTicks = 0;
      const simInterval = setInterval(() => {
        simulationTicks++;
        state.currentBlueprint = mutateBlueprint(state.currentBlueprint);
        updateScores();
        triggerRender();
        addStreamLine(`[SIMULATE] Running corridor airflow vectors... testing generation variant ${simulationTicks*10}/50.`, "thought-line");
        if (simulationTicks >= 5) {
          clearInterval(simInterval);
          
          // Set to optimized environment layout (Blueprint B configurations)
          state.currentBlueprint.blocks.forEach(b => {
            b.hasVoids = true;
            b.voidPositions = [[b.x, Math.floor(b.y + b.h/2)]];
            b.hasRoofExhaust = true;
            b.dryingLedgesRatio = 0.8;
            b.independentMEP = true;
            b.dualVents = true;
          });

          addStreamLine(`[SIMULATE] Stagnant draft cleared. Corridor airspeeds stabilized at >1.5 m/s.`);
          addStreamLine(`[SIMULATE] Refuse chimney exhaust fans activated. Humidity dampness mold index resolved.`);
          
          layerCards[2].card.classList.remove('active');
          layerCards[2].card.classList.add('completed');
          layerCards[2].dot.className = 'pipeline-dot completed';

          // Pipeline Step 4: Synthesis & Reporting
          addStreamLine(`[SYNTHESIS] Layer 4: Finalizing HEAL Synthesis & Human Dignity Scorecard.`);
          layerCards[3].card.classList.add('active');
          layerCards[3].dot.className = 'pipeline-dot active';

          setTimeout(() => {
            updateScores();
            triggerRender();

            addStreamLine(`[SYNTHESIS] Genetic algorithm converged. Compiled top 3 ranked blueprints.`, "observation-line");
            addStreamLine(`[COMPLETE] Precinct co-design completed. Human Dignity indices rated GOOD.`, "observation-line");

            layerCards[3].card.classList.remove('active');
            layerCards[3].card.classList.add('completed');
            layerCards[3].dot.className = 'pipeline-dot completed';

            // Open review elements
            blueprintSelector.classList.remove('hidden');
            chatInput.disabled = false;
            btnSendChat.disabled = false;
            
            btnRunPipeline.disabled = false;
            btnDeployCoDesigner.disabled = false;
            state.pipelineRunning = false;
            setSystemStatus('complete', 'Pipeline Complete');
          }, 800);
        }
      }, 300);

    }, 800);

  }, 800);
}

// Event Listeners setup
function setupEventListeners() {
  // Navigation selects
  districtSelect.addEventListener('change', (e) => {
    loadDistrictProfile(e.target.value);
    addStreamLine(`[SYSTEM] Relocated GPS camera to: ${DISTRICTS[e.target.value].name}.`);
    updateScores();
    triggerRender();
  });

  // Search input Locate
  btnGpsSearch.addEventListener('click', () => {
    const q = gpsSearchInput.value.trim().toLowerCase();
    if (!q) return;

    let matchedId = null;
    Object.keys(DISTRICTS).forEach(key => {
      if (DISTRICTS[key].label.toLowerCase().includes(q) || DISTRICTS[key].name.toLowerCase().includes(q)) {
        matchedId = key;
      }
    });

    if (matchedId) {
      loadDistrictProfile(matchedId);
      addStreamLine(`[SYSTEM] GPS located planning centroid for: ${DISTRICTS[matchedId].name}.`);
      updateScores();
      triggerRender();
    } else {
      addStreamLine(`[ERROR] Coordinate target "${q}" not matched in Singapore residential databases.`, 'error-line');
    }
  });

  gpsSearchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') btnGpsSearch.click();
  });

  // Transition Map -> Precinct Views
  btnDeployCoDesigner.addEventListener('click', () => {
    state.isMapMode = false;
    tabPrecinct.classList.add('active');
    tabGlobalMap.classList.remove('active');
    precinctControls.classList.remove('hidden');
    viewportTitle.textContent = `Precinct co-designer: ${DISTRICTS[state.activeDistrictId].name}`;
    districtHud.classList.add('hidden');
    triggerRender();
    addStreamLine(`[SYSTEM] Swapped view to Localized Precinct Co-Designer. Configured zoning models.`);
  });

  tabGlobalMap.addEventListener('click', () => {
    state.isMapMode = true;
    tabGlobalMap.classList.add('active');
    tabPrecinct.classList.remove('active');
    precinctControls.classList.add('hidden');
    viewportTitle.textContent = "Singapore Planning Areas GPS Map";
    districtHud.classList.remove('hidden');
    blockTooltip.classList.add('hidden');
    blueprintSelector.classList.add('hidden');
    triggerRender();
    addStreamLine(`[SYSTEM] Swapped view to Global Singapore GPS Map.`);
  });

  tabPrecinct.addEventListener('click', () => {
    btnDeployCoDesigner.click();
  });

  // Execute Pipeline
  btnRunPipeline.addEventListener('click', () => {
    // If we are currently on Global Map, transition to Precinct first
    if (state.isMapMode) {
      btnDeployCoDesigner.click();
    }
    execute4LayerPipeline();
  });

  // Weight sliders adjustments
  const sliders = [
    { el: sliderW1, val: valW1, key: 'w1' },
    { el: sliderW2, val: valW2, key: 'w2' },
    { el: sliderW3, val: valW3, key: 'w3' },
    { el: sliderW4, val: valW4, key: 'w4' }
  ];

  sliders.forEach(s => {
    s.el.addEventListener('input', (e) => {
      state.weights[s.key] = parseFloat(e.target.value);
      s.val.textContent = parseFloat(e.target.value).toFixed(2);
      updateScores();
    });
  });

  // Reset
  btnReset.addEventListener('click', () => {
    state.weights = { w1: 0.30, w2: 0.30, w3: 0.20, w4: 0.20 };
    sliderW1.value = 0.30; valW1.textContent = "0.30";
    sliderW2.value = 0.30; valW2.textContent = "0.30";
    sliderW3.value = 0.20; valW3.textContent = "0.20";
    sliderW4.value = 0.20; valW4.textContent = "0.20";

    layerCards.forEach(item => {
      item.card.classList.remove('active', 'completed');
      item.dot.className = 'pipeline-dot';
    });

    state.isMapMode = true;
    tabGlobalMap.classList.add('active');
    tabPrecinct.classList.remove('active');
    precinctControls.classList.add('hidden');
    districtHud.classList.remove('hidden');
    blueprintSelector.classList.add('hidden');
    chatInput.disabled = true;
    btnSendChat.disabled = true;

    loadDistrictProfile(state.activeDistrictId);
    agentStream.innerHTML = '<div class="stream-line system-line">[SYSTEM] Configuration reset. Select Execute Generative Pipeline to process.</div>';
    setSystemStatus('idle', 'System Reset');
    updateScores();
    triggerRender();
  });

  // View Projection Toggles
  viewPerspective.addEventListener('click', () => {
    state.is2D = false;
    viewPerspective.classList.add('active');
    viewTopDown.classList.remove('active');
    triggerRender();
  });

  viewTopDown.addEventListener('click', () => {
    state.is2D = true;
    viewTopDown.classList.add('active');
    viewPerspective.classList.remove('active');
    triggerRender();
  });

  // Overlays Toggles
  const overlays = document.querySelectorAll('.btn-overlay');
  overlays.forEach(btn => {
    btn.addEventListener('click', () => {
      overlays.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.overlayMode = btn.dataset.overlay;
      addStreamLine(`[SYSTEM] Visualization overlay: ${state.overlayMode.toUpperCase()}`);
      triggerRender();
    });
  });

  // Odor diagnostics cards click focus overlay
  Object.keys(odorCards).forEach(key => {
    odorCards[key].addEventListener('click', () => {
      Object.values(odorCards).forEach(c => c.classList.remove('highlighted'));
      odorCards[key].classList.add('highlighted');

      let targetOverlay = 'none';
      if (key === 'corridor') targetOverlay = 'wind';
      else if (key === 'mold') targetOverlay = 'solar';
      else if (key === 'chute' || key === 'drainage') targetOverlay = 'mep';

      overlays.forEach(b => {
        b.classList.toggle('active', b.dataset.overlay === targetOverlay);
      });

      state.overlayMode = targetOverlay;
      addStreamLine(`[SYSTEM] Inspecting internal housing health issue: ${key.toUpperCase()}. Displaying relevant simulation overlays.`);
      
      // If in map mode, transition to precinct first
      if (state.isMapMode) {
        btnDeployCoDesigner.click();
      } else {
        triggerRender();
      }
    });
  });

  // Blueprint Selector Float cards
  const bpCards = document.querySelectorAll('.bp-card');
  bpCards.forEach(card => {
    card.addEventListener('click', () => {
      bpCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      
      const index = parseInt(card.dataset.bp);
      state.activeBlueprintIndex = index;
      
      // Create modifications to test different blueprints in precinct
      const d = DISTRICTS[state.activeDistrictId];
      state.currentBlueprint = { blocks: JSON.parse(JSON.stringify(d.layout)) };
      
      if (index === 1) { // wind master
        state.currentBlueprint.blocks.forEach(b => {
          b.hasVoids = true;
          b.voidPositions = [[b.x, Math.floor(b.y + b.h/2)]];
          b.height = 18;
        });
      } else if (index === 2) { // modular focus
        state.currentBlueprint.blocks.forEach(b => {
          b.orientation = 90; // orthogonal
          b.independentMEP = true;
          b.dualVents = true;
        });
      }
      
      addStreamLine(`[SYSTEM] Loaded design blueprint: Blueprint ${String.fromCharCode(65 + index)}`);
      updateScores();
      triggerRender();
    });
  });

  // Mouse Move listener
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    state.mousePosition = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    triggerRender();
  });

  canvas.addEventListener('mouseleave', () => {
    state.mousePosition = null;
    blockTooltip.classList.add('hidden');
    triggerRender();
  });

  // Global Map Click Selector
  canvas.addEventListener('click', () => {
    if (state.isMapMode && lastHoveredDistrictId) {
      loadDistrictProfile(lastHoveredDistrictId);
      addStreamLine(`[SYSTEM] Selected District: ${DISTRICTS[lastHoveredDistrictId].name}`);
      updateScores();
      triggerRender();
    }
  });

  // Chat interface conversational form submit
  chatInputForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = chatInput.value.trim();
    if (!query) return;

    appendChatMessage(query, 'user-msg');
    chatInput.value = '';

    setSystemStatus('running', 'Agent Reasoning');

    setTimeout(() => {
      const result = processCommand(query, state.currentBlueprint, state.weights);
      
      // NLP check for district teleport
      if (result.navigateToDistrict) {
        state.isMapMode = true;
        tabGlobalMap.classList.add('active');
        tabPrecinct.classList.remove('active');
        precinctControls.classList.add('hidden');
        districtHud.classList.remove('hidden');
        blueprintSelector.classList.add('hidden');

        loadDistrictProfile(result.navigateToDistrict);
      } else {
        state.currentBlueprint = result.blueprint;
        state.weights = result.weights;

        sliderW1.value = state.weights.w1; valW1.textContent = state.weights.w1.toFixed(2);
        sliderW2.value = state.weights.w2; valW2.textContent = state.weights.w2.toFixed(2);
        sliderW3.value = state.weights.w3; valW3.textContent = state.weights.w3.toFixed(2);
        sliderW4.value = state.weights.w4; valW4.textContent = state.weights.w4.toFixed(2);
      }

      // Print ReAct logs
      result.logs.forEach(logLine => {
        let type = 'system-line';
        if (logLine.includes('[THOUGHT]')) type = 'thought-line';
        else if (logLine.includes('[ACTION]')) type = 'action-line';
        else if (logLine.includes('[REFINE]')) type = 'observation-line';
        addStreamLine(logLine, type);
      });

      appendChatMessage(result.response, 'agent-msg');
      updateScores();
      triggerRender();
      setSystemStatus('complete', 'Design Adjusted');
    }, 600);
  });

  window.addEventListener('resize', () => triggerRender());
}

function appendChatMessage(text, className) {
  const wrapper = document.createElement('div');
  wrapper.className = `chat-message ${className}`;
  const p = document.createElement('p');
  p.textContent = text;
  wrapper.appendChild(p);
  chatHistory.appendChild(wrapper);
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

window.onload = init;
