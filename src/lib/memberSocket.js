import { io } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:8000";

/**
 * memberSocket.js — the Member panel's own realtime connection.
 *
 * The existing `getSocket` authenticates with `jinanam_access_token` (the ADMIN
 * token) and caches one socket per namespace in a module-level map. A member
 * connecting through it would either present the admin's credentials or none at
 * all, and both panels would share one connection — exactly the coupling the
 * member panel was separated from.
 *
 * This keeps its own cache and authenticates with `jinanam_member_access_token`,
 * so the two panels can be connected simultaneously without touching each
 * other's session.
 */
const memberSockets = new Map();

export function getMemberSocket(namespace = "/") {
  if (memberSockets.has(namespace)) return memberSockets.get(namespace);

  const token = localStorage.getItem("jinanam_member_access_token");
  const socket = io(`${SOCKET_URL}${namespace}`, {
    auth: { token },
    transports: ["websocket", "polling"],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 8,
    reconnectionDelay: 1500,
  });

  memberSockets.set(namespace, socket);
  return socket;
}

/**
 * Called on member logout. Without this the socket keeps the old token alive
 * and the next member to sign in on the same device inherits the connection.
 */
export function disconnectMemberSockets() {
  memberSockets.forEach((s) => {
    try { s.disconnect(); } catch { /* already gone */ }
  });
  memberSockets.clear();
}

export { SOCKET_URL };
