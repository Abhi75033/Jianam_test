/**
 * Member Panel API client — Transactions slice.
 *
 * Endpoints follow the Member Panel Specification §C4.6 (Bookings),
 * §C4.7 (Donations) and §C4.8 (Events). The backend does not implement these
 * yet; every call below matches the documented contract exactly so the screens
 * light up as soon as the API lands. Nothing here invents a new endpoint.
 *
 * All responses are assumed to follow the platform envelope { data: ... }.
 * `unwrap` tolerates both `{data:{...}}` and a bare payload.
 */
import { api } from "@/lib/api";

const unwrap = (res) => {
  const body = res?.data;
  if (body && Object.prototype.hasOwnProperty.call(body, "data")) return body.data;
  return body;
};

const list = (value) => (Array.isArray(value) ? value : value?.items || []);

/* ─── §C4.1 Identity ───────────────────────────────────────────────────────
 * §B1.3: "The API decides the allowed methods; the app must not hardcode this."
 * A configuration table maps country → allowed authentication methods, so the
 * client renders whatever check-identity returns. The +91 heuristic below is
 * only a fallback for when the endpoint is unavailable.
 * ---------------------------------------------------------------------- */
export const memberAuthApi = {
  /**
   * @returns {{ exists:boolean, status?:string, allowed_methods:string[] }}
   *          allowed_methods ⊂ ["mobile_otp","email_otp","google"]
   */
  async checkIdentity(identifier) {
    const isEmail = identifier.includes("@");
    return unwrap(
      await api.post("/auth/check-identity", isEmail ? { email: identifier } : { mobile: identifier })
    );
  },

  /** §B1.4 — minimum fields only: name + verified mobile + community. */
  async register({ registrationToken, firstName, surname, mobile, memberType, communityId }) {
    return unwrap(
      await api.post("/auth/register", {
        registration_token: registrationToken,
        first_name: firstName,
        surname,
        mobile,
        member_type: memberType,
        community_id: communityId,
      })
    );
  },
};

/** Fallback tiering when /auth/check-identity is unreachable (§B1.3). */
export function fallbackMethodsFor(identifier = "") {
  if (identifier.includes("@")) return ["email_otp", "google"];
  const digits = identifier.replace(/[^\d+]/g, "");
  if (digits.startsWith("+91") || /^(0|91)?[6-9]\d{9}$/.test(digits)) return ["mobile_otp"];
  return ["email_otp", "google"];
}

/* ─── §C4.6 Bookings ───────────────────────────────────────────────────── */
export const bookingsApi = {
  /** Unified My Bookings across accommodation, general bookings, tickets and tours (§B16.7). */
  async mine(params = {}) {
    return list(unwrap(await api.get("/bookings", { params })));
  },
  /** Detail with the full status timeline (§B16.5). */
  async detail(uid) {
    return unwrap(await api.get(`/bookings/${uid}`));
  },
  /** Upload payment proof inside the payment window (§B15.5). */
  async uploadProof(uid, { file, reference, notes }) {
    const fd = new FormData();
    if (file) fd.append("proof", file);
    if (reference) fd.append("reference", reference);
    if (notes) fd.append("notes", notes);
    return unwrap(
      await api.post(`/bookings/${uid}/payment-proof`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    );
  },
  /** Phase 1 is request-only; admin approves (§B16.8). */
  async requestCancel(uid, reason) {
    return unwrap(await api.post(`/bookings/${uid}/cancel`, { reason }));
  },
  /** Join the FIFO waiting list (§B15.6). */
  async joinWaitingList(uid) {
    return unwrap(await api.post(`/bookings/${uid}/waiting-list`, {}));
  },
};

/* ─── §C4.7 Donations ──────────────────────────────────────────────────── */
export const donationsApi = {
  /** Bank / UPI / QR details and the institution's categories (§B18.3). */
  async targets(institutionId) {
    return unwrap(await api.get("/donations/targets", { params: { institution_id: institutionId } }));
  },
  /** Record intent, returns transfer instructions. Amount is minor units (§B18.12). */
  async createManual({ institutionId, categoryId, amountMinor, currency, note }) {
    return unwrap(
      await api.post("/donations/manual", {
        institution_id: institutionId,
        category_id: categoryId,
        amount_minor: amountMinor,
        currency,
        note,
      })
    );
  },
  async uploadProof(uid, { file, reference, note }) {
    const fd = new FormData();
    if (file) fd.append("proof", file);
    if (reference) fd.append("reference", reference);
    if (note) fd.append("note", note);
    return unwrap(
      await api.post(`/donations/${uid}/proof`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    );
  },
  /** History with filters and financial-year totals (§B18.9). */
  async mine(params = {}) {
    const payload = unwrap(await api.get("/donations", { params }));
    return {
      items: list(payload),
      totals: payload?.totals || null, // { financial_year, total_minor, eligible_80g_minor, currency }
    };
  },
  async receiptUrl(uid) {
    return unwrap(await api.get(`/donations/${uid}/receipt`));
  },
};

/* ─── §C4.8 Events ─────────────────────────────────────────────────────── */
export const eventsApi = {
  /** scope: upcoming | today | past (§B19.2). */
  async browse({ scope = "upcoming", category, lat, lng } = {}) {
    return list(unwrap(await api.get("/events", { params: { scope, category, lat, lng } })));
  },
  async detail(displayId) {
    return unwrap(await api.get(`/events/${displayId}`));
  },
  /** RSVP with a total count or explicit attendee member IDs (§B19.6). */
  async rsvp(eventId, { attendees, memberIds }) {
    return unwrap(
      await api.post(`/events/${eventId}/rsvp`, {
        ...(memberIds?.length ? { member_ids: memberIds } : { attendees }),
      })
    );
  },
  /** Cancelling promotes the first waiting-list member (§B19.6). */
  async cancelRsvp(eventId) {
    return unwrap(await api.delete(`/events/${eventId}/rsvp`));
  },
  async joinWaitingList(eventId) {
    return unwrap(await api.post(`/events/${eventId}/waiting-list`, {}));
  },
  /** Ticket list includes the signed QR token (§B19.8). */
  async myTickets() {
    return list(unwrap(await api.get("/my/tickets")));
  },
  async ticket(uid) {
    return unwrap(await api.get(`/my/tickets/${uid}`));
  },
  /** RSVP, attended and ticketed history. */
  async myEvents() {
    return list(unwrap(await api.get("/my/events")));
  },
};

/* ─── Money helpers ────────────────────────────────────────────────────────
 * §B18.12: amounts are integer minor units with an explicit currency code —
 * never floats. Format only at the edge, never in state.
 * ---------------------------------------------------------------------- */
export function formatMinor(amountMinor, currency = "INR", locale = "en-IN") {
  if (amountMinor == null) return "—";
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(
      Number(amountMinor) / 100
    );
  } catch {
    return `${currency} ${(Number(amountMinor) / 100).toFixed(2)}`;
  }
}

export function toMinor(amount) {
  const n = Number(amount);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}
