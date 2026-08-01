import React, { createContext, useContext, useState, useEffect } from "react";

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

  // Active Travel Location
  const [travelLocation, setTravelLocation] = useState(null);

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
  };

  const sortContent = (items) => prioritizeContentList(items, effectivePrefs, followedIds);

  return (
    <VisibilityEngineContext.Provider
      value={{
        userPreferences: effectivePrefs,
        followedIds,
        travelLocation,
        toggleFollow,
        isEntityFollowed,
        updateCommunityPreferences,
        updateTravelLocation,
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
      toggleFollow: () => {},
      isEntityFollowed: (id) => ["JFJT108", "JFMS108"].includes(id),
      updateCommunityPreferences: () => {},
      updateTravelLocation: () => {},
      sortContent: (items) => items,
    };
  }
  return context;
}
