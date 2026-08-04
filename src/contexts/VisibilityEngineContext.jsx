import React, { createContext, useContext, useState, useEffect } from "react";
import { distanceToEntity } from "@/lib/geo";

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

export function calculateContentPriority(item, userPreferences, followedIds = []) {
  // Dharamshala Exception: Common facility for all
  const isDharamshala = item.entityType === "DHARAMSHALA" || item.type === "DHARAMSHALA" || item.publicId?.startsWith("JFD");
  
  // Rule 1: Check if entity is followed by user
  const entityId = item.entityPublicId || item.publicId || item.entityId || item.id;
  const isFollowed = followedIds.includes(entityId) || item.isFollowed;

  if (isFollowed) {
    return 1; // Priority 1: Followed Entity (Highest)
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
export function prioritizeContentList(items, userPreferences, followedIds = []) {
  if (!Array.isArray(items)) return [];

  return [...items].sort((a, b) => {
    const priorityA = calculateContentPriority(a, userPreferences, followedIds);
    const priorityB = calculateContentPriority(b, userPreferences, followedIds);
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
  const [followedIds, setFollowedIds] = useState(() => {
    const saved = localStorage.getItem("jinanam_followed_entities");
    return saved ? JSON.parse(saved) : ["JFJT108", "JFMS108", "JFJC108"];
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

  const toggleFollow = (entityId) => {
    setFollowedIds((prev) => {
      if (prev.includes(entityId)) {
        return prev.filter((id) => id !== entityId);
      } else {
        return [...prev, entityId];
      }
    });
  };

  const isEntityFollowed = (entityId) => {
    return followedIds.includes(entityId);
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

  const sortContent = (items) => prioritizeContentList(items, effectivePrefs, followedIds);

  /** Distance in km from the current device fix to any entity with coordinates. */
  const distanceTo = (entity) => distanceToEntity(deviceCoords, entity);

  return (
    <VisibilityEngineContext.Provider
      value={{
        userPreferences: effectivePrefs,
        followedIds,
        travelLocation,
        deviceCoords,
        hasDeviceLocation: Boolean(deviceCoords),
        toggleFollow,
        isEntityFollowed,
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
      followedIds: ["JFJT108", "JFMS108"],
      travelLocation: null,
      deviceCoords: null,
      hasDeviceLocation: false,
      toggleFollow: () => {},
      isEntityFollowed: (id) => ["JFJT108", "JFMS108"].includes(id),
      updateCommunityPreferences: () => {},
      updateTravelLocation: () => {},
      updateDeviceCoords: () => {},
      distanceTo: () => null,
      sortContent: (items) => items,
    };
  }
  return context;
}
