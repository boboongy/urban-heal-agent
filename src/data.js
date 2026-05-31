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

const MATURE_TOWN_GRID = [
  1,1,0,3,0,0,3,0,1,1,
  1,0,0,3,4,4,3,0,0,1,
  0,0,1,3,0,0,3,1,0,0,
  3,3,3,3,3,3,3,3,3,3,
  0,4,0,3,1,1,3,0,4,0,
  0,4,0,3,1,1,3,0,4,0,
  3,3,3,3,0,0,3,3,3,3,
  0,0,1,0,0,4,0,1,0,0,
  1,0,0,0,4,4,0,0,0,1,
  1,1,0,3,0,0,3,0,1,1
];

const GREEN_TOWN_GRID = [
  4,4,0,3,3,3,3,0,4,4,
  4,0,0,0,0,0,0,0,0,4,
  0,0,1,1,0,0,1,1,0,0,
  3,0,1,1,0,0,1,1,0,3,
  3,0,0,0,4,4,0,0,0,3,
  0,0,0,0,4,4,0,0,0,0,
  0,0,1,1,4,4,1,1,0,0,
  3,0,1,1,0,0,1,1,0,3,
  4,0,0,0,0,0,0,0,0,4,
  4,4,0,3,3,3,3,0,4,4
];

const DENSE_CORE_GRID = [
  1,1,1,0,1,1,0,1,1,1,
  1,1,1,0,1,1,0,1,1,1,
  1,1,1,0,0,0,0,1,1,1,
  0,0,0,0,3,3,0,0,0,0,
  1,1,1,0,1,1,0,1,1,1,
  1,1,1,0,1,1,0,1,1,1,
  0,0,0,0,3,3,0,0,0,0,
  1,1,1,0,0,0,0,1,1,1,
  1,1,1,0,1,1,0,1,1,1,
  1,1,1,0,1,1,0,1,1,1
];

// District starting presets to populate the sandbox grid
export const DISTRICT_PRESETS = {
  tampines: {
    name: "Tampines Regional Hub",
    coordinates: { lat: 1.3525, lng: 103.9447 },
    planningArea: "Tampines",
    dataStatus: "mock-grid-with-live-context",
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
  toapayoh: {
    name: "Toa Payoh Town Centre",
    coordinates: { lat: 1.3343, lng: 103.8563 },
    planningArea: "Toa Payoh",
    dataStatus: "live-osm-grid-with-mock-fallback",
    demographics: "Pilot district: mature HDB estate | Real grid layer: OSM buildings, roads, and parks",
    grid: [
      1,1,0,3,0,0,3,0,1,1,
      1,0,0,3,4,4,3,0,0,1,
      0,0,1,3,0,0,3,1,0,0,
      3,3,3,3,3,3,3,3,3,3,
      0,4,0,3,1,1,3,0,4,0,
      0,4,0,3,1,1,3,0,4,0,
      3,3,3,3,0,0,3,3,3,3,
      0,0,1,0,0,4,0,1,0,0,
      1,0,0,0,4,4,0,0,0,1,
      1,1,0,3,0,0,3,0,1,1
    ]
  },
  amk: {
    name: "Ang Mo Kio Town Centre",
    coordinates: { lat: 1.3691, lng: 103.8454 },
    planningArea: "Ang Mo Kio",
    dataStatus: "live-osm-grid-with-mock-fallback",
    demographics: "Mature town pilot | Real grid layer: OSM buildings, roads, and parks",
    grid: MATURE_TOWN_GRID
  },
  bishan: {
    name: "Bishan Town Centre",
    coordinates: { lat: 1.3508, lng: 103.8485 },
    planningArea: "Bishan",
    dataStatus: "live-osm-grid-with-mock-fallback",
    demographics: "Central town pilot | Real grid layer: OSM buildings, roads, and parks",
    grid: MATURE_TOWN_GRID
  },
  queenstown: {
    name: "Queenstown Town Centre",
    coordinates: { lat: 1.2942, lng: 103.7861 },
    planningArea: "Queenstown",
    dataStatus: "live-osm-grid-with-mock-fallback",
    demographics: "Mature estate pilot | Real grid layer: OSM buildings, roads, and parks",
    grid: MATURE_TOWN_GRID
  },
  bedok: {
    name: "Bedok Town Centre",
    coordinates: { lat: 1.3240, lng: 103.9301 },
    planningArea: "Bedok",
    dataStatus: "live-osm-grid-with-mock-fallback",
    demographics: "East region pilot | Real grid layer: OSM buildings, roads, and parks",
    grid: MATURE_TOWN_GRID
  },
  woodlands: {
    name: "Woodlands Regional Centre",
    coordinates: { lat: 1.4360, lng: 103.7864 },
    planningArea: "Woodlands",
    dataStatus: "live-osm-grid-with-mock-fallback",
    demographics: "North region pilot | Real grid layer: OSM buildings, roads, and parks",
    grid: GREEN_TOWN_GRID
  },
  yishun: {
    name: "Yishun Town Centre",
    coordinates: { lat: 1.4295, lng: 103.8353 },
    planningArea: "Yishun",
    dataStatus: "live-osm-grid-with-mock-fallback",
    demographics: "North region pilot | Real grid layer: OSM buildings, roads, and parks",
    grid: GREEN_TOWN_GRID
  },
  hougang: {
    name: "Hougang Town Centre",
    coordinates: { lat: 1.3713, lng: 103.8926 },
    planningArea: "Hougang",
    dataStatus: "live-osm-grid-with-mock-fallback",
    demographics: "Northeast town pilot | Real grid layer: OSM buildings, roads, and parks",
    grid: MATURE_TOWN_GRID
  },
  clementi: {
    name: "Clementi Town Centre",
    coordinates: { lat: 1.3151, lng: 103.7651 },
    planningArea: "Clementi",
    dataStatus: "live-osm-grid-with-mock-fallback",
    demographics: "West region pilot | Real grid layer: OSM buildings, roads, and parks",
    grid: MATURE_TOWN_GRID
  },
  bukittimah: {
    name: "Bukit Timah Nature Edge",
    coordinates: { lat: 1.3294, lng: 103.8021 },
    planningArea: "Bukit Timah",
    dataStatus: "live-osm-grid-with-mock-fallback",
    demographics: "Green corridor pilot | Real grid layer: OSM buildings, roads, and parks",
    grid: GREEN_TOWN_GRID
  },
  marinabay: {
    name: "Marina Bay Downtown",
    coordinates: { lat: 1.2834, lng: 103.8607 },
    planningArea: "Marina Bay",
    dataStatus: "live-osm-grid-with-mock-fallback",
    demographics: "Dense commercial core pilot | Real grid layer: OSM buildings, roads, parks, and waterfront",
    grid: DENSE_CORE_GRID
  },
  punggol: {
    name: "Punggol Eco-Town Core",
    coordinates: { lat: 1.4052, lng: 103.9023 },
    planningArea: "Punggol",
    dataStatus: "mock-grid-with-live-context",
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
    coordinates: { lat: 1.3404, lng: 103.7058 },
    planningArea: "Jurong West",
    dataStatus: "mock-grid-with-live-context",
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
    coordinates: { lat: 1.2798, lng: 103.8520 },
    planningArea: "Downtown Core",
    dataStatus: "mock-grid-with-live-context",
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
