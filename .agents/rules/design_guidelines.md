# Heal Urban Agent: Design Guidelines & Rules

This document outlines the rules, constraints, and heuristics utilized by the **Heal Urban Agent** to simulate and optimize layout changes within the sandbox grid.

---

## 1. Environmental Guidelines

### Green Canopy Density (GCD)
- **Target Threshold:** Minimum 30% green canopy coverage for urban precincts.
- **Formula:**
  $$\text{GCD} = \frac{\text{Tree Tiles} + \text{Park Tiles}}{\text{Total Grid Tiles}} \times 100\%$$

### Urban Heat Island (UHI) Index & Heat Reduction
- **Base Temperature:** Concrete surfaces have a baseline heat absorption coefficient of $+45.0^\circ C$ under direct solar rays. Soil has $+32.0^\circ C$.
- **Mitigation Factors:**
  - **Tree Canopy:** Places a shade bubble of radius 1 grid cell. All adjacent concrete/soil nodes inside the shade bubble receive a $-5.2^\circ C$ temperature offset.
  - **Pocket Park:** Reflects solar radiation. Lowers localized heat indices by $-4.0^\circ C$ for its own cell and adjacent soils.
- **Goal:** Achieve a Heat Reduction Index of at least $-3.0^\circ C$ across the precinct.

---

## 2. Structural & Permeability Constraints

### Surface Permeability Ratio (SPR)
- **Permeability Coefficients:**
  - Soil (Empty land): 1.0 (100% permeable)
  - Tree Canopy: 0.95 (Highly permeable)
  - Pocket Park: 0.90 (Highly permeable)
  - Permeable Path: 0.85 (Permeable)
  - Roads/Asphalt: 0.05 (Non-permeable)
  - Concrete Buildings: 0.00 (Non-permeable)
- **Formula:**
  $$\text{SPR} = \frac{\sum (\text{TileCount}_i \times \text{Coef}_i)}{\text{Total Tiles}} \times 100\%$$
- **Target Threshold:** SPR must be $\ge 60\%$ to prevent rainwater runoff and promote local ground saturation.

---

## 3. Pedestrian & Livability Heuristics

### Walking Circulation (Foot Traffic Connectivity)
- **Pathway Stacking:** Roads and Permeable paths must form continuous networks connecting all Concrete Building portals.
- **Walking Radius:** Pocket parks and green zones must sit within a 3-cell radius of every building cell to guarantee accessible green spaces.
