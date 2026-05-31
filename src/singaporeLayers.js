const WEATHER_ENDPOINTS = {
  temperature: "https://api.data.gov.sg/v1/environment/air-temperature",
  humidity: "https://api.data.gov.sg/v1/environment/relative-humidity",
  windSpeed: "https://api.data.gov.sg/v1/environment/wind-speed"
};

const OVERPASS_ENDPOINT = "https://overpass-api.de/api/interpreter";
const GRID_SIZE = 10;

const DEFAULT_CONTEXT = {
  status: "fallback",
  source: "Mock baseline + live API unavailable",
  gridStatus: "mock",
  gridSource: "Mock preset",
  temperature: null,
  humidity: null,
  windSpeed: null,
  station: null,
  observedAt: null,
  osmFeatureCount: 0,
  heights: null,
  heightSource: "No building height layer loaded"
};

function distanceKm(a, b) {
  const earthRadiusKm = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadiusKm * Math.asin(Math.sqrt(h));
}

async function fetchReading(url, districtCoordinates) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Weather API returned ${response.status}`);

  const payload = await response.json();
  const stations = payload.metadata?.stations ?? [];
  const readings = payload.items?.[0]?.readings ?? [];

  const enriched = readings
    .map((reading) => {
      const station = stations.find((item) => item.id === reading.station_id);
      if (!station?.location) return null;
      const location = { lat: station.location.latitude, lng: station.location.longitude };
      return {
        stationId: station.id,
        stationName: station.name,
        value: reading.value,
        location,
        distanceKm: distanceKm(districtCoordinates, location),
        observedAt: payload.items?.[0]?.timestamp ?? null
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return enriched[0] ?? null;
}

export async function loadSingaporeContext(preset) {
  if (!preset?.coordinates) return DEFAULT_CONTEXT;

  try {
    const [temperature, humidity, windSpeed, gridLayer] = await Promise.all([
      fetchReading(WEATHER_ENDPOINTS.temperature, preset.coordinates),
      fetchReading(WEATHER_ENDPOINTS.humidity, preset.coordinates),
      fetchReading(WEATHER_ENDPOINTS.windSpeed, preset.coordinates),
      fetchOsmGrid(preset.coordinates)
    ]);

    const nearest = temperature ?? humidity ?? windSpeed;
    if (!nearest && gridLayer.status !== "live") return DEFAULT_CONTEXT;

    return {
      status: "live",
      source: "data.gov.sg NEA realtime weather stations",
      gridStatus: gridLayer.status,
      gridSource: gridLayer.source,
      grid: gridLayer.grid,
      heights: gridLayer.heights,
      heightSource: gridLayer.heightSource,
      osmFeatureCount: gridLayer.featureCount,
      temperature: temperature?.value ?? null,
      humidity: humidity?.value ?? null,
      windSpeed: windSpeed?.value ?? null,
      station: nearest?.stationName ?? null,
      distanceKm: nearest?.distanceKm ?? null,
      observedAt: nearest?.observedAt ?? null
    };
  } catch (error) {
    console.warn("Singapore data layer unavailable:", error);
    return DEFAULT_CONTEXT;
  }
}

export function formatSingaporeContext(preset, context) {
  const location = `${preset.planningArea ?? preset.name} (${preset.coordinates.lat.toFixed(4)}, ${preset.coordinates.lng.toFixed(4)})`;
  if (context.status !== "live") {
    return `${location} | Grid: mock preset | Weather: fallback pending live API`;
  }

  const observed = context.observedAt ? new Date(context.observedAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  }) : "latest";

  return [
    location,
    `Grid: ${context.gridStatus === "live" ? `live OSM (${context.osmFeatureCount} features)` : "mock preset"}`,
    `Nearest NEA station: ${context.station ?? "--"}`,
    `Temp: ${context.temperature ?? "--"}C`,
    `RH: ${context.humidity ?? "--"}%`,
    `Wind: ${context.windSpeed ?? "--"} m/s`,
    `Obs: ${observed}`
  ].join(" | ");
}

async function fetchOsmGrid(center) {
  try {
    const radiusMeters = 320;
    const query = `
      [out:json][timeout:12];
      (
        way["building"](around:${radiusMeters},${center.lat},${center.lng});
        way["highway"](around:${radiusMeters},${center.lat},${center.lng});
        way["leisure"="park"](around:${radiusMeters},${center.lat},${center.lng});
        way["landuse"="grass"](around:${radiusMeters},${center.lat},${center.lng});
        way["landuse"="recreation_ground"](around:${radiusMeters},${center.lat},${center.lng});
        way["natural"="wood"](around:${radiusMeters},${center.lat},${center.lng});
        way["natural"="water"](around:${radiusMeters},${center.lat},${center.lng});
        node["natural"="tree"](around:${radiusMeters},${center.lat},${center.lng});
      );
      out geom 900;
    `;

    const headers = {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      Accept: "application/json"
    };
    if (typeof window === "undefined") {
      headers["Accept-Language"] = "en-US,en;q=0.9";
      headers["User-Agent"] = "UrbanHealAgent/1.0 educational prototype";
    }

    const response = await fetch(OVERPASS_ENDPOINT, {
      method: "POST",
      headers,
      body: new URLSearchParams({ data: query })
    });

    if (!response.ok) throw new Error(`Overpass returned ${response.status}`);
    const payload = await response.json();
    const elements = (payload.elements ?? []).filter((element) => element.geometry?.length || element.type === "node");
    if (!elements.length) throw new Error("No OSM geometry found");

    return {
      status: "live",
      source: "OpenStreetMap Overpass buildings, roads, trees, and green space",
      ...rasterizeOsmElements(elements, center, radiusMeters),
      featureCount: elements.length
    };
  } catch (error) {
    console.warn("OSM grid layer unavailable:", error);
    return {
      status: "fallback",
      source: "Mock grid preset",
      grid: null,
      heights: null,
      heightSource: "Mock fallback heights",
      featureCount: 0
    };
  }
}

function rasterizeOsmElements(elements, center, radiusMeters) {
  const grid = Array(GRID_SIZE * GRID_SIZE).fill(0);
  const heights = Array(GRID_SIZE * GRID_SIZE).fill(0);
  const latDelta = radiusMeters / 111320;
  const lngDelta = radiusMeters / (111320 * Math.cos((center.lat * Math.PI) / 180));
  const bounds = {
    minLat: center.lat - latDelta,
    maxLat: center.lat + latDelta,
    minLng: center.lng - lngDelta,
    maxLng: center.lng + lngDelta
  };

  const cellCenters = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, idx) => {
    const row = Math.floor(idx / GRID_SIZE);
    const col = idx % GRID_SIZE;
    return {
      idx,
      row,
      col,
      lat: bounds.maxLat - ((row + 0.5) / GRID_SIZE) * (bounds.maxLat - bounds.minLat),
      lon: bounds.minLng + ((col + 0.5) / GRID_SIZE) * (bounds.maxLng - bounds.minLng)
    };
  });

  const orderedElements = [...elements].sort((a, b) => tilePriority(osmTileType(a.tags)) - tilePriority(osmTileType(b.tags)));

  orderedElements.forEach((element) => {
    const tileType = osmTileType(element.tags);
    const polygon = element.geometry?.map((point) => ({ lat: point.lat, lon: point.lon })) ?? [];
    if (element.type === "node" && typeof element.lat === "number" && typeof element.lon === "number") {
      const idx = coordinateToIndex(element.lat, element.lon, bounds);
      if (idx !== null) setTile(grid, heights, idx, tileType, heightFromTags(element.tags));
      return;
    }

    if (tileType === 3) {
      markLineCells(grid, heights, polygon, bounds, tileType);
      return;
    }

    cellCenters.forEach((cell) => {
      if (pointInPolygon(cell, polygon)) {
        setTile(grid, heights, cell.idx, tileType, heightFromTags(element.tags));
      }
    });
  });

  return {
    grid,
    heights,
    heightSource: "OSM height/building:levels tags where present; estimated 30m for untagged buildings"
  };
}

function osmTileType(tags = {}) {
  if (tags.natural === "tree") return 2;
  if (tags.highway) return 3;
  if (tags.building) return 1;
  if (tags.leisure === "park" || tags.landuse === "grass" || tags.landuse === "recreation_ground" || tags.natural === "wood") return 4;
  if (tags.natural === "water") return 4;
  return 0;
}

function tilePriority(tileType) {
  if (tileType === 4) return 1;
  if (tileType === 3) return 2;
  if (tileType === 1) return 3;
  return 0;
}

function heightFromTags(tags = {}) {
  if (!tags.building) return 0;

  const rawHeight = String(tags.height ?? "").replace(/m/i, "").trim();
  const parsedHeight = Number.parseFloat(rawHeight);
  if (Number.isFinite(parsedHeight) && parsedHeight > 0) return Math.min(parsedHeight, 180);

  const levels = Number.parseFloat(tags["building:levels"]);
  if (Number.isFinite(levels) && levels > 0) return Math.min(levels * 3.2, 180);

  return 30;
}

function setTile(grid, heights, index, tileType, height = 0) {
  if (tileType === 0) return;
  if (grid[index] === 1 && tileType !== 1) return;
  if (grid[index] === 3 && tileType === 4) return;
  grid[index] = tileType;
  if (tileType === 1) heights[index] = Math.max(heights[index], height);
  if (tileType === 2) heights[index] = Math.max(heights[index], 8);
}

function markLineCells(grid, heights, geometry, bounds, tileType) {
  geometry.forEach((point) => {
    const idx = coordinateToIndex(point.lat, point.lon, bounds);
    if (idx !== null) setTile(grid, heights, idx, tileType);
  });
}

function coordinateToIndex(lat, lon, bounds) {
  const col = Math.floor(((lon - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * GRID_SIZE);
  const row = Math.floor(((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * GRID_SIZE);
  if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) return null;
  return row * GRID_SIZE + col;
}

function pointInPolygon(point, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lon;
    const yi = polygon[i].lat;
    const xj = polygon[j].lon;
    const yj = polygon[j].lat;
    const intersects = ((yi > point.lat) !== (yj > point.lat)) &&
      (point.lon < ((xj - xi) * (point.lat - yi)) / (yj - yi || 1e-12) + xi);
    if (intersects) inside = !inside;
  }
  return inside;
}
