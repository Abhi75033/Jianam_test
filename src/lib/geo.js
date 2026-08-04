/**
 * geo.js — distance math for the member panel's location engine.
 *
 * No geocoding API is configured anywhere in this project (no Google/Mapbox
 * key in env), so this deliberately does NOT resolve coordinates to a place
 * name. What it does is honest and self-contained: given two lat/lng pairs,
 * how far apart are they, and how should that read to a person.
 */

const EARTH_RADIUS_KM = 6371;

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

/** Great-circle distance between two points, in kilometres. */
export function haversineKm(lat1, lng1, lat2, lng2) {
  if ([lat1, lng1, lat2, lng2].some((v) => v == null || Number.isNaN(Number(v)))) {
    return null;
  }
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** "450 m" under a km, "12 km" above it, comma-grouped past 1,000. */
export function formatDistance(km) {
  if (km == null || Number.isNaN(km)) return "";
  if (km < 1) return `${Math.max(1, Math.round(km * 1000))} m`;
  const rounded = km < 10 ? Math.round(km * 10) / 10 : Math.round(km);
  return `${rounded.toLocaleString("en-IN")} km`;
}

/**
 * Pull a {lat, lng} pair off an entity, trying every field name seen across
 * the codebase's org/event/offer shapes. Returns null rather than guessing
 * when nothing is present, so distance simply doesn't render instead of
 * showing a wrong number.
 */
export function extractCoords(entity) {
  if (!entity) return null;
  const lat = entity.latitude ?? entity.lat ?? entity.location?.lat ?? entity.geoLocation?.latitude;
  const lng = entity.longitude ?? entity.lng ?? entity.location?.lng ?? entity.geoLocation?.longitude;
  if (lat == null || lng == null) return null;
  const latN = Number(lat), lngN = Number(lng);
  if (Number.isNaN(latN) || Number.isNaN(lngN)) return null;
  return { lat: latN, lng: lngN };
}

/** Distance in km from a device fix to an entity, or null if either is missing. */
export function distanceToEntity(deviceCoords, entity) {
  const target = extractCoords(entity);
  if (!deviceCoords || !target) return null;
  return haversineKm(deviceCoords.lat, deviceCoords.lng, target.lat, target.lng);
}
