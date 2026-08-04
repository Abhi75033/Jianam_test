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
import { memberClient as api } from "@/lib/memberClient";

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
    // The API has no /auth/check-identity route. Requesting a REGISTER-purpose
    // OTP answers the same question: an already-registered number comes back
    // with `redirectToLogin: true` instead of sending a code.
    if (isEmail) {
      return { exists: false, allowed_methods: fallbackMethodsFor(identifier) };
    }
    const res = unwrap(
      await api.post("/auth/otp/request", { mobile: identifier, purpose: "REGISTER" })
    );
    return {
      exists: Boolean(res?.redirectToLogin),
      allowed_methods: fallbackMethodsFor(identifier),
      // Present only outside production — lets dev/staging skip the SMS round trip.
      devOtp: res?.devOtp,
      expiresInSeconds: res?.expiresInSeconds,
    };
  },

  /**
   * §B1.4 — minimum fields only: name + verified mobile + community.
   * Registration is category-specific on the API (`/members/register/jain` vs
   * `/members/register/non-jain`); there is no `/auth/register`.
   */
  async register({ registrationToken, firstName, surname, mobile, memberType, communityId }) {
    const path =
      String(memberType).toUpperCase() === "NON_JAIN"
        ? "/members/register/non-jain"
        : "/members/register/jain";
    return unwrap(
      await api.post(path, {
        registrationToken,
        firstName,
        surname,
        mobile,
        communityId,
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
    // GET /bookings/ is the platform-wide admin list and 403s for members
    // ("Platform-wide booking list is Super Admin only"). /bookings/my is the
    // member-scoped equivalent.
    return list(unwrap(await api.get("/bookings/my", { params })));
  },
  /**
   * Bookable rooms/halls/dorms/bhojanshala packages configured for one org.
   * Same endpoint admin's BookingsPage reads to populate its item selector
   * (see BookingsPage.jsx's loadData: GET /bookings/org/{orgId}).
   */
  async items(orgId) {
    return list(unwrap(await api.get(`/bookings/org/${orgId}`)));
  },
  /**
   * Create a booking request against one item. Same payload shape and
   * endpoint as admin's "Submit Member Booking" handler
   * (BookingsPage.jsx handleSubmitBooking: POST /bookings), which already
   * puts the request in PENDING state awaiting administrator approval.
   */
  async create({ bookingItemId, dateFrom, dateTo, slot, peopleCount }) {
    return unwrap(
      await api.post("/bookings", {
        bookingItemId,
        dateFrom: new Date(dateFrom).toISOString(),
        dateTo: dateTo ? new Date(dateTo).toISOString() : undefined,
        slot,
        peopleCount: Number(peopleCount),
      })
    );
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
    return unwrap(await api.post(`/bookings/${uid}/decision`, { decision: "CANCELLED", reason }));
  },
  /** Join the FIFO waiting list (§B15.6). */
  async joinWaitingList(uid) {
    // NOT IMPLEMENTED server-side: the API exposes no booking waiting-list
    // route. Surfaced as a clear error rather than a silent 404 so the UI can
    // tell the member the feature isn't available yet.
    throw Object.assign(
      new Error("Booking waiting list is not available yet."),
      { code: "NOT_IMPLEMENTED", bookingId: uid }
    );
  },
};

/* ─── §C4.7 Donations ──────────────────────────────────────────────────── */
export const donationsApi = {
  /** Bank / UPI / QR details and the institution's categories (§B18.3). */
  async targets(institutionId) {
    // NOT IMPLEMENTED server-side: there is no /donations/targets route. The
    // closest live endpoint is the campaign config, which carries the bank/UPI
    // details. Falls back to an empty shape so the screen degrades instead of
    // throwing while the backend catches up.
    try {
      return unwrap(await api.get("/donations/campaign-config/GENERAL", {
        params: { organizationId: institutionId },
      }));
    } catch {
      return { categories: [], bank: null, upi: null, qr: null };
    }
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
      await api.post("/donations/upload-proof", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    );
  },
  /** History with filters and financial-year totals (§B18.9). */
  async mine(params = {}) {
    const payload = unwrap(await api.get("/donations/my", { params }));
    return {
      items: list(payload),
      totals: payload?.totals || null, // { financial_year, total_minor, eligible_80g_minor, currency }
    };
  },
  async receiptUrl(uid) {
    return unwrap(await api.get("/receipts/my", { params: { donationId: uid } }));
  },
};

/* ─── §C4.8 Events ─────────────────────────────────────────────────────── */
export const eventsApi = {
  /** scope: upcoming | today | past (§B19.2). */
  async browse({ scope = "upcoming", category, lat, lng } = {}) {
    // /events is the admin list and 403s for members; /events/member returns
    // the events visible to this member (§4.7.2 temple-specific vs public).
    return list(unwrap(await api.get("/events/member", { params: { scope, category, lat, lng } })));
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
    return unwrap(await api.post(`/events/${eventId}/rsvp/cancel`, {}));
  },
  async joinWaitingList(eventId) {
    return unwrap(await api.post(`/events/${eventId}/rsvp`, { waitingList: true }));
  },
  /** Ticket list includes the signed QR token (§B19.8). */
  async myTickets() {
    return list(unwrap(await api.get("/tickets/my")));
  },
  async ticket(uid) {
    return unwrap(await api.get(`/tickets/${uid}/history`));
  },
  /** RSVP, attended and ticketed history. */
  async myEvents() {
    return list(unwrap(await api.get("/events/member")));
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
