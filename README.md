# Urban Heal AI Agent 🌿🏙️

> **Inspiration:** Inspired by the **Singapore Urban Context Analysis AI Agent** framework, adapting advanced generative spatial workflows to tackle the global affordable housing crisis.

**Urban Heal** is a generative co-designer AI agent engineered to address skyrocketing property values and the vanishing of affordable urban housing. Instead of acting as a passive software tool where a planner manually draws blocks and checks compliance, this agent ingests live urban data layers, legal constraints, and architectural components to autonomously simulate thousands of layout permutations—outputting the most optimized, buildable, and livable precinct blueprints.

By using generative architecture rooted in real-world Singapore planning parameters, Urban Heal solves the brutal math of land scarcity while mathematically ensuring human dignity, safety, and healthy microclimates (mitigating critical high-density issues like stagnant corridor air, rubbish chute odors, and indoor mold).

---

## 🏗️ The H.E.A.L. Urban Optimization Framework

The agent’s generative capabilities are structured into four core pillars:

### 1. High-Density Efficiency (The Spatial Engine)
* **What it does:** Maximizes Gross Plot Ratio (GPR) and unit yields. Automatically stacks wet walls (bathrooms/kitchens) vertically to minimize plumbing and electrical conduit costs.
* **Planner Value:** Eliminates manual guess-and-check layout configurations to fit target affordable housing quotas on constrained plots in minutes.

### 2. Environmental Performance (The Microclimate Engine)
* **What it does:** Runs continuous Computational Fluid Dynamics (CFD) wind simulations and solar radiation mapping. Adjusts building angles, heights, and spacing.
* **Planner Value:** Combats the Urban Heat Island (UHI) effect. Uses staggered wind voids and breathability slots to flush out stagnant corridor odors and introduces sun-facing drying ledges to naturally suppress mold growth.

### 3. Adaptability & Logistics (The Industrial Engine)
* **What it does:** Adapts generative designs to standard PPVC (Prefabricated Prefinished Volumetric Construction) 3D concrete module dimensions.
* **Planner Value:** Lowers construction labor costs, reduces material waste, and accelerates building timelines by bridging the gap between concept and factory manufacturing.

### 4. Livability & Social Fabric (The Human Engine)
* **What it does:** Generates recessed entryway nooks for corridor fire safety, offsets windows to preserve tenant privacy while doors are open for ventilation, and maps precise 5-minute walking radii to green spaces and eldercare zones.
* **Planner Value:** Guarantees that high-density estates do not feel like "mega-block" prisons, engineering human dignity and social infrastructure directly into the fabric of the architecture.

---

## 🧮 Core Objective Function

The AI agent operates on a balanced optimization logic, continuously striving to maximize the following mathematical fitness function:

$$\text{Design Fitness} = w_1(\text{Density}) + w_2(\text{Natural Airflow}) + w_3(\text{Modular Repeatability}) - w_4(\text{Construction Cost})$$

The ultimate value proposition: The agent does not replace the urban planner; it frees them from tedious manual calculation and compliance checking, allowing them to focus entirely on community-building and human-centric design.

---

## 🛠️ Data Infrastructure & Production APIs

Urban Heal connects directly to real-world production data streams to ground its generative simulations:

| Framework Layer | API Source | Data Fed Into Agent |
| :--- | :--- | :--- |
| **1. Context Demographics** | URA Data Service & OneMap API (SLA) | Real estate transactions, planning boundaries, baseline neighborhood census figures, and HDB/rental site polygon maps. |
| **2. H.E.A.L. Structural Analysis** | OneMap 3D Building Tiles API | Actual 3D structural building shapes, exact heights, and block geometry coordinates directly onto the rendering canvas. |
| **3. Olfactory & Airflow** | MSS (Meteorological Service Singapore) & NEA APIs | Live seasonal wind vectors, ambient outdoor temperatures, and high-humidity spikes to calibrate CFD wind and pressure models. |

---

## 🔄 Operational Workflow
1. **Define Constraints & Ingest Data (Input):** The planner inputs site boundaries, target unit counts, URA zoning guidelines, and local microclimate datasets (wind paths, solar mapping) into the agent.
2. **Algorithmic Evolution & Simulation (Processing):** The agent runs thousands of parallel background simulations, tweaking building orientation, staggering block heights, and calculating mechanical/plumbing efficiencies.
3. **Constraint Filtering & Ranking (Optimization):** Filters out layouts violating building codes or safety regulations, ranking the survivors using a balanced **"Livability vs. Cost"** scoring matrix.
4. **Interactive Review & Selection (Output):** Presents the planner with the top 3–5 distinct, high-performing 3D blueprints. Planners can make micro-adjustments conversationally (e.g., *"Shift block C to allow more sunlight into the central plaza"*).

---

## 📦 Quick Start

### Installation
```bash
git clone [https://github.com/yourusername/urban-heal-ai-agent.git](https://github.com/yourusername/urban-heal-ai-agent.git)
cd urban-heal-ai-agent
pip install -r requirements.txt
