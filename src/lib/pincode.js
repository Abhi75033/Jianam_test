/**
 * Pincode → address lookup (India).
 *
 * Uses the free India Post PIN code service. It is deliberately isolated here
 * so it can be swapped for a JiNANAM backend endpoint later without touching
 * any form: keep the same return shape and only change `fetchFromSource`.
 *
 * Returns null when the pincode is unknown, offline, or the request fails —
 * callers should treat a null result as "leave the fields alone".
 */

const ENDPOINT = "https://api.postalpincode.in/pincode";

// Same pincode is often typed in both Current and Permanent address.
const cache = new Map();

export function isLookupablePincode(pincode, country = "India") {
  const pin = String(pincode || "").trim();
  const isIndia = !country || /^india$/i.test(String(country).trim());
  return isIndia && /^[1-9][0-9]{5}$/.test(pin);
}

async function fetchFromSource(pin, signal) {
  const res = await fetch(`${ENDPOINT}/${pin}`, { signal });
  if (!res.ok) throw new Error(`pincode lookup failed: ${res.status}`);
  const json = await res.json();
  const entry = Array.isArray(json) ? json[0] : null;
  if (!entry || entry.Status !== "Success" || !Array.isArray(entry.PostOffice) || !entry.PostOffice.length) {
    return null;
  }

  const offices = entry.PostOffice;
  const first = offices[0];
  return {
    // Every locality that shares this pincode — lets the form offer a choice.
    areas: [...new Set(offices.map((o) => o.Name).filter(Boolean))],
    area: first.Name || "",
    city: first.Division || first.District || "",
    district: first.District || "",
    state: first.State || "",
    country: first.Country || "India",
  };
}

/**
 * @param {string} pincode  6-digit Indian PIN
 * @param {AbortSignal} [signal]
 * @returns {Promise<{areas:string[],area:string,city:string,district:string,state:string,country:string}|null>}
 */
export async function lookupPincode(pincode, signal) {
  const pin = String(pincode || "").trim();
  if (!isLookupablePincode(pin)) return null;
  if (cache.has(pin)) return cache.get(pin);

  try {
    const result = await fetchFromSource(pin, signal);
    cache.set(pin, result); // cache misses too, so we don't re-hit for bad pins
    return result;
  } catch (err) {
    if (err?.name === "AbortError") throw err;
    return null; // network/CORS/offline — fail quiet, user types manually
  }
}
