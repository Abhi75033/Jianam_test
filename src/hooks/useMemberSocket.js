import { useEffect, useRef, useState } from "react";
import { getMemberSocket } from "@/lib/memberSocket";

/**
 * useMemberSocket — subscribe a member screen to a realtime namespace.
 *
 * Mirrors the admin `useSocket` API so the two read the same way, but routes
 * through the member-scoped connection (member token, separate cache).
 *
 * Handlers are held in a ref and re-read on each event, so a screen can close
 * over fresh state without the subscription tearing down and re-handshaking on
 * every render.
 *
 * @param {string} namespace  e.g. "/tracking", "/dashboards"
 * @param {object} handlers   { "event:name": fn }
 * @param {object} options    { enabled, query }
 * @returns {{ connected: boolean, socket: object|null }}
 */
export function useMemberSocket(namespace, handlers = {}, options = {}) {
  const { enabled = true, query = {} } = options;
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!enabled) return undefined;

    const socket = getMemberSocket(namespace);
    socketRef.current = socket;

    if (Object.keys(query).length && socket.io?.opts) {
      socket.io.opts.query = { ...socket.io.opts.query, ...query };
    }

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    const events = Object.keys(handlersRef.current || {});
    const wrapped = {};
    events.forEach((ev) => {
      wrapped[ev] = (...args) => {
        const fn = handlersRef.current?.[ev];
        if (typeof fn === "function") fn(...args);
      };
      socket.on(ev, wrapped[ev]);
    });

    if (socket.connected) setConnected(true);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      events.forEach((ev) => socket.off(ev, wrapped[ev]));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [namespace, enabled, JSON.stringify(query)]);

  return { connected, socket: socketRef.current };
}

export default useMemberSocket;
