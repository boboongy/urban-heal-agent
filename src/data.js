/**
 * Heal Urban Agent - Data Store
 * Defines grid sandbox cell types, district-specific presets, and metrics parameters.
 */

export const GRID_SIZE = 10; // 10x10 Grid (100 cells total)

export const TILE_TYPES = {
  soil: { id: 0, label: "Soil", emoji: "🟫", class: "cell-soil", SPR: 1.0, tempOffset: 0 },
  concrete: { id: 1, label: "Concrete Building", emoji: "🏢", class: "cell-concrete", SPR: 0.0, tempOffset: 13 },
  green: { id: 2, label: "Eco Tree", emoji: "🌳", class: "cell-green", SPR: 0.95, tempOffset: -5.2 },
  road: { id: 3, label: "Asphalt Road", emoji: "🛣️", class: "cell-road", SPR: 0.05, tempOffset: 10 },
  park: { id: 4, label: "Pocket Park", emoji: "⛲", class: "cell-park", SPR: 0.9, tempOffset: -4.0 },
  path: { id: 5, label: "Permeable Path", emoji: "🚶", class: "cell-path", SPR: 0.85, tempOffset: -2.0 }
};

// District starting presets to populate the sandbox grid
export const DISTRICT_PRESETS = {
  tampines: {
    name: "Tampines Regional Hub",
    demographics: "Wage inflation gap: 6.2% | Rental Ratio: 18.4%",
    grid: [
      1,1,0,0,3,0,0,1,1,1,
      1,1,0,0,0,0,0,1,1,1,
      0,0,3,0,0,3,0,0,0,0,
      3,0,0,3,3,3,3,0,3,0,
      0,0,0,1,1,1,1,0,0,0,
      0,0,0,1,1,1,1,0,0,3,
      3,0,0,0,3,0,0,0,0,0,
      1,1,0,3,0,3,0,0,1,1,
      1,1,1,0,0,0,0,1,1,1,
      1,1,1,0,3,0,0,1,1,1
    ]
  },
  punggol: {
    name: "Punggol Eco-Town Core",
    demographics: "Wage inflation gap: 5.1% | Rental Ratio: 14.2%",
    grid: [
      4,4,0,3,3,3,3,0,4,4,
      4,0,0,0,0,0,0,0,0,4,
      0,0,1,1,0,0,1,1,0,0,
      3,0,1,1,0,0,1,1,0,3,
      3,0,0,0,0,0,0,0,0,3,
      0,0,0,0,4,4,0,0,0,0,
      0,0,1,1,4,4,1,1,0,0,
      3,0,1,1,0,0,1,1,0,3,
      4,0,0,0,0,0,0,0,0,4,
      4,4,0,3,3,3,3,0,4,4
    ]
  },
  jurong: {
    name: "Jurong Industrial Sector",
    demographics: "Wage inflation gap: 7.2% | Rental Ratio: 24.5%",
    grid: [
      1,1,1,1,1,1,1,1,1,1,
      1,1,1,1,1,1,1,1,1,1,
      3,0,0,0,0,0,0,0,0,3,
      0,0,0,0,0,0,0,0,0,0,
      0,0,0,0,0,0,0,0,0,0,
      0,0,0,0,0,0,0,0,0,0,
      0,0,0,0,0,0,0,0,0,0,
      3,0,0,0,0,0,0,0,0,3,
      1,1,1,1,1,1,1,1,1,1,
      1,1,1,1,1,1,1,1,1,1
    ]
  },
  downtown: {
    name: "Downtown Concrete Core",
    demographics: "Wage inflation gap: 14.8% | Rental Ratio: 5.4%",
    grid: [
      1,1,1,0,1,1,0,1,1,1,
      1,1,1,0,1,1,0,1,1,1,
      1,1,1,0,0,0,0,1,1,1,
      0,0,0,0,0,0,0,0,0,0,
      1,1,1,0,1,1,0,1,1,1,
      1,1,1,0,1,1,0,1,1,1,
      0,0,0,0,0,0,0,0,0,0,
      1,1,1,0,0,0,0,1,1,1,
      1,1,1,0,1,1,0,1,1,1,
      1,1,1,0,1,1,0,1,1,1
    ]
  }
};
