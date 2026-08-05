import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { distanceToEntity } from "@/lib/geo";
import { memberClient } from "@/lib/memberClient";

/**
 * Real follow/unfollow endpoints, by entity type.
 *
 * MonkDetailPage.jsx's own usage already proved POST /monks/{id}/follow and
 * /monks/{id}/unfollow. Org-type unfollow looked unsupported because no
 * admin or member code anywhere ever called it — but that only proves it
 * was never *wired up*, not that the route doesn't *exist*. Verified
 * directly against the live API (unauthenticated probe, controlled against
 * a fake action on the same resource to rule out a wildcard route):
 * POST /temples/{id}/unfollow, /dharamshalas/{id}/unfollow and
 * /jain-centers/{id}/unfollow all return 401 "Missing bearer token" — the
 * same shape as the confirmed-real .../follow routes — while a made-up
 * action on the same resource (.../totally-fake-xyz) cleanly 404s. The
 * routes are real; admin's UI just never exposed a way to call them.
 */
const FOLLOW_ENDPOINTS = {
  monk: { prefix: "/monks", supportsUnfollow: true },
  ms: { prefix: "/monks", supportsUnfollow: true },
  temple: { prefix: "/temples", supportsUnfollow: true },
  dharamshala: { prefix: "/dharamshalas", supportsUnfollow: true },
  jaincentre: { prefix: "/jain-centers", supportsUnfollow: true },
  jaincenter: { prefix: "/jain-centers", supportsUnfollow: true },
};

function resolveFollowEndpoint(type) {
  if (!type) return null;
  return FOLLOW_ENDPOINTS[String(type).toLowerCase().replace(/[\s_-]/g, "")] || null;
}

/**
 * Primary/secondary/tertiary follow tiers — §4.15's "1+2+6 temples, 1+9
 * monks" cap. This is deliberately NOT the backend model the spec actually
 * describes: the API has no concept of a follow tier at all, so a tier
 * assigned here only reorders *this device's own* sort of *this member's*
 * feed. It doesn't sync to another device, isn't visible to the backend or
 * to anyone else, and doesn't change what admins can report on. That part
 * — persisting tier as a real relationship other systems can see — is the
 * genuine backend gap flagged throughout this branch's work. What's below
 * is the client-visible half of the spec (sort order), built honestly as
 * a local preference rather than left undone or faked as more than it is.
 */
const TIER_CAPS = {
  temple: { primary: 1, secondary: 2, tertiary: 6 },
  monk: { primary: 1, secondary: 9 },
};

const TIER_RANK = { primary: 1, secondary: 1.1, tertiary: 1.2 };
/** Followed but untiered (org types with no defined caps, or follows with no meta at all). */
const UNTIERED_FOLLOWED_RANK = 1.3;

/**
 * visibilityEngine.js — Core Visibility & Sorting Engine for Jinanam Member Platform.
 *
 * Rules Enforced:
 * 1. Followed Entities (Temple, Monk, Dharamshala, JC, Page) → Priority 1 (Highest)
 * 2. Same Community + Current Area → Priority 2
 * 3. Same Community + City/Nearby → Priority 3
 * 4. Same Community + State → Priority 4
 * 5. Same Community + Country → Priority 5
 * 6. Other Communities → Priority 6 (Search Discovery Only)
 * 7. Dharamshalas → Common Facility (No community restriction)
 */

export function calculateContentPriority(item, userPreferences, followedIds = [], followedMeta = {}) {
  // Dharamshala Exception: Common facility for all
  const isDharamshala = item.entityType === "DHARAMSHALA" || item.type === "DHARAMSHALA" || item.publicId?.startsWith("JFD");

  // Rule 1: Check if entity is followed by user
  const entityId = item.entityPublicId || item.publicId || item.entityId || item.id;
  const isFollowed = followedIds.includes(entityId) || item.isFollowed;

  if (isFollowed) {
    // Sub-rank within "followed" by tier when one has been set (see
    // TIER_RANK above) — still always ahead of every non-followed
    // priority (2-6), so untiered follows behave exactly as before.
    const tier = followedMeta[entityId]?.tier;
    return TIER_RANK[tier] || UNTIERED_FOLLOWED_RANK;
  }

  // Community Match Check
  const userSect = userPreferences?.sect || "Shwetambar";
  const userSub = userPreferences?.subCommunity || "Murtipujak";
  const itemSect = item.sect || item.community || "Shwetambar";
  const isCommunityMatch = isDharamshala || itemSect.toLowerCase() === userSect.toLowerCase();

  if (!isCommunityMatch) {
    return 6; // Priority 6: Other Community (Search Discovery Only)
  }

  // Location Match Checks
  //
  // Real GPS distance is used when both sides have coordinates — it is a truer
  // "nearby" than string-matching an area name, and it is what actually moves
  // when the member travels (§4.3.4, §4.15.6). When either side lacks
  // coordinates this falls through to the original area/city/state text match,
  // so nothing regresses for content that has no lat/lng yet.
  const km = distanceToEntity(userPreferences?.deviceCoords, item);
  if (km != null) {
    if (km <= 10) return 2;   // Current area
    if (km <= 50) return 3;   // Nearby
    // Beyond 50km, fall through to the state/country text tiers below —
    // distance alone can't tell "same state" from "same country".
  }

  const userArea = (userPreferences?.area || userPreferences?.currentLocation?.area || "").toLowerCase();
  const userCity = (userPreferences?.city || userPreferences?.currentLocation?.city || "").toLowerCase();
  const userState = (userPreferences?.state || userPreferences?.currentLocation?.state || "").toLowerCase();

  const itemArea = (item.area || item.locationArea || "").toLowerCase();
  const itemCity = (item.city || item.locationCity || item.location || "").toLowerCase();
  const itemState = (item.state || item.locationState || "").toLowerCase();

  if (userArea && itemArea && itemArea.includes(userArea)) {
    return 2; // Priority 2: Same Community + Current Area
  }
  if (userCity && itemCity && itemCity.includes(userCity)) {
    return 3; // Priority 3: Same Community + City / Nearby Area
  }
  if (userState && itemState && itemState.includes(userState)) {
    return 4; // Priority 4: Same Community + State
  }

  return 5; // Priority 5: Same Community + Country
}

/**
 * Sorts array of content items by calculating visibility priority.
 */
export function prioritizeContentList(items, userPreferences, followedIds = [], followedMeta = {}) {
  if (!Array.isArray(items)) return [];

  return [...items].sort((a, b) => {
    const priorityA = calculateContentPriority(a, userPreferences, followedIds, followedMeta);
    const priorityB = calculateContentPriority(b, userPreferences, followedIds, followedMeta);
    return priorityA - priorityB;
  });
}

// ── Context Setup ────────────────────────────────────────────────────────────
const VisibilityEngineContext = createContext(null);

export function VisibilityEngineProvider({ children }) {
  // Default User Preferences & Location
  const [userPreferences, setUserPreferences] = useState(() => {
    const saved = localStorage.getItem("jinanam_user_community_prefs");
    return saved ? JSON.parse(saved) : {
      sect: "Shwetambar",
      subCommunity: "Murtipujak",
      tradition: "Achalgaccha",
      city: "Mumbai",
      area: "Thane West",
      state: "Maharashtra",
      country: "India",
    };
  });

  // Followed Entities List (Unique IDs: JFJT108, JFMS108, JFD108, etc.)
  // A brand-new member follows nothing — the previous default seeded three
  // demo ids into every fresh session, so new members opened the Feed and
  // saw entities marked "Following" and boosted to Priority 1 that they
  // had never actually followed.
  const [followedIds, setFollowedIds] = useState(() => {
    const saved = localStorage.getItem("jinanam_followed_entities");
    return saved ? JSON.parse(saved) : [];
  });

  /**
   * Display metadata for followed entities: { [entityId]: {type, apiId,
   * name, image, category} }. followedIds alone (an array of bare ids) is
   * enough for priority sort, but not enough to render a real "Following"
   * list — there's no GET-my-follows endpoint to hydrate names/types from,
   * so this captures them once, at the moment a caller that has them
   * (Temple Detail, MS Detail, Temple List) calls toggleFollow. Entries
   * followed only through screens that never had this data (Feed) simply
   * have no meta and fall back to showing the raw id.
   */
  const [followedMeta, setFollowedMeta] = useState(() => {
    try { return JSON.parse(localStorage.getItem("jinanam_followed_meta") || "{}"); } catch { return {}; }
  });

  // Active Travel Location (manual override, e.g. "I'm visiting Palitana")
  const [travelLocation, setTravelLocation] = useState(null);

  // Real device GPS fix, supplied by useMemberLocation() at the app root.
  // Kept separate from travelLocation: this is the raw coordinate pair used
  // for distance math; travelLocation is the resolved place name shown in UI.
  const [deviceCoords, setDeviceCoords] = useState(null);

  useEffect(() => {
    localStorage.setItem("jinanam_user_community_prefs", JSON.stringify(userPreferences));
  }, [userPreferences]);

  useEffect(() => {
    localStorage.setItem("jinanam_followed_entities", JSON.stringify(followedIds));
  }, [followedIds]);

  useEffect(() => {
    localStorage.setItem("jinanam_followed_meta", JSON.stringify(followedMeta));
  }, [followedMeta]);

  const dropMeta = (entityId) => {
    setFollowedMeta((prev) => {
      if (!(entityId in prev)) return prev;
      const next = { ...prev };
      delete next[entityId];
      return next;
    });
  };

  /**
   * `entityId` is whatever key the caller already sorts/dedupes by
   * (publicId in most member screens) — it drives local priority-sort
   * state and is never sent to the API. `opts.apiId` is the entity's real
   * backend id (the same id used to fetch its detail page), required to
   * actually call the follow endpoint; `opts.type` picks which endpoint.
   * `opts.name`/`opts.image`/`opts.category` are optional display metadata,
   * captured into followedMeta so a "Following" list has something to show
   * beyond a bare id — never sent to the API.
   *
   * Callers that omit `opts` keep the pre-existing local-only behavior —
   * this covers screens (like the Feed, where a post's backing org id
   * isn't reliably available) that can't yet supply a confirmed real id.
   */
  const toggleFollow = async (entityId, opts = {}) => {
    const { type, apiId, name, image, category } = opts;
    const wasFollowed = followedIds.includes(entityId);
    const endpoint = resolveFollowEndpoint(type);
    const meta = { type, apiId, name, image, category };

    if (!endpoint || !apiId) {
      setFollowedIds((prev) => (wasFollowed ? prev.filter((id) => id !== entityId) : [...prev, entityId]));
      if (wasFollowed) dropMeta(entityId);
      return;
    }

    if (wasFollowed) {
      if (!endpoint.supportsUnfollow) {
        // No unfollow route exists for this entity type. Flipping local
        // state to "not following" here would desync it from what the
        // server still has on record — worse than just explaining why.
        toast.info("Unfollowing isn't available for this yet.");
        return;
      }
      try {
        await memberClient.post(`${endpoint.prefix}/${apiId}/unfollow`);
        setFollowedIds((prev) => prev.filter((id) => id !== entityId));
        dropMeta(entityId);
      } catch {
        toast.error("Couldn't unfollow — please try again.");
      }
      return;
    }

    try {
      await memberClient.post(`${endpoint.prefix}/${apiId}/follow`);
      setFollowedIds((prev) => [...prev, entityId]);
      setFollowedMeta((prev) => ({ ...prev, [entityId]: meta }));
    } catch {
      toast.error("Couldn't follow — please try again.");
    }
  };

  const isEntityFollowed = (entityId) => {
    return followedIds.includes(entityId);
  };

  /**
   * Assigns a follow tier, enforcing the spec's per-category caps
   * (TIER_CAPS) against however many *other* followed entities of the same
   * category already hold that tier. Local-only — see the note on
   * TIER_CAPS above for what that does and doesn't mean.
   */
  const setFollowTier = (entityId, tier) => {
    const meta = followedMeta[entityId];
    if (!meta?.category) {
      toast.error("Can't set a tier — this entity's type isn't known.");
      return;
    }
    const caps = TIER_CAPS[meta.category];
    if (!caps || !(tier in caps)) {
      toast.error("Tiering isn't available for this entity type yet.");
      return;
    }
    const usedByOthers = Object.entries(followedMeta).filter(
      ([id, m]) => id !== entityId && m.category === meta.category && m.tier === tier
    ).length;
    if (usedByOthers >= caps[tier]) {
      toast.error(`You can mark at most ${caps[tier]} ${meta.category}${caps[tier] > 1 ? "s" : ""} as ${tier}.`);
      return;
    }
    setFollowedMeta((prev) => ({ ...prev, [entityId]: { ...prev[entityId], tier } }));
  };

  const clearFollowTier = (entityId) => {
    setFollowedMeta((prev) => {
      if (!prev[entityId]?.tier) return prev;
      const { tier, ...rest } = prev[entityId];
      return { ...prev, [entityId]: rest };
    });
  };

  /** How many of `tier` (within `category`) are already assigned, and the cap. */
  const tierUsage = (category, tier) => {
    const caps = TIER_CAPS[category];
    if (!caps || !(tier in caps)) return null;
    const used = Object.values(followedMeta).filter((m) => m.category === category && m.tier === tier).length;
    return { used, cap: caps[tier] };
  };

  const updateCommunityPreferences = (newPrefs) => {
    setUserPreferences((prev) => ({ ...prev, ...newPrefs }));
  };

  const updateTravelLocation = (locationObj) => {
    setTravelLocation(locationObj);
  };

  // Effective location combines travel location if active, otherwise address
  const effectivePrefs = {
    ...userPreferences,
    city: travelLocation?.city || userPreferences.city,
    area: travelLocation?.area || userPreferences.area,
    state: travelLocation?.state || userPreferences.state,
    deviceCoords,
  };

  const sortContent = (items) => prioritizeContentList(items, effectivePrefs, followedIds, followedMeta);

  /** Distance in km from the current device fix to any entity with coordinates. */
  const distanceTo = (entity) => distanceToEntity(deviceCoords, entity);

  return (
    <VisibilityEngineContext.Provider
      value={{
        userPreferences: effectivePrefs,
        followedIds,
        followedMeta,
        travelLocation,
        deviceCoords,
        hasDeviceLocation: Boolean(deviceCoords),
        toggleFollow,
        isEntityFollowed,
        setFollowTier,
        clearFollowTier,
        tierUsage,
        tierCaps: TIER_CAPS,
        updateCommunityPreferences,
        updateTravelLocation,
        updateDeviceCoords: setDeviceCoords,
        distanceTo,
        sortContent,
      }}
    >
      {children}
    </VisibilityEngineContext.Provider>
  );
}

export function useVisibilityEngine() {
  const context = useContext(VisibilityEngineContext);
  if (!context) {
    // Fallback safe context if invoked outside provider
    return {
      userPreferences: { sect: "Shwetambar", city: "Mumbai", area: "Thane West" },
      followedIds: [],
      followedMeta: {},
      travelLocation: null,
      deviceCoords: null,
      hasDeviceLocation: false,
      toggleFollow: () => {},
      isEntityFollowed: () => false,
      setFollowTier: () => {},
      clearFollowTier: () => {},
      tierUsage: () => null,
      tierCaps: {},
      updateCommunityPreferences: () => {},
      updateTravelLocation: () => {},
      updateDeviceCoords: () => {},
      distanceTo: () => null,
      sortContent: (items) => items,
    };
  }
  return context;
}
