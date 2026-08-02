# Member Panel — Spec vs Code Gap Analysis

**Phase 1 deliverable.** PRD sections read in full: §3.2.3–3.8 (member role, permissions
matrix, deletion rules), §4.1–4.8 (overview, auth, dashboard, monk tracking, temple
directory, bookings, events, paid events), §4.9–4.11.4 (tours, volunteers, feed, polls),
§4.15–4.17.3 (member linking, donations, notification channels), §4.21.8–4.21.13
(calendar, Tithi).

**Not read in full:** §4.11.5 (ad placement detail), §4.12 (offers page), §4.13 (gallery),
§4.14 (announcements), §4.17.4–4.20 (notification triggers/priority, search, manual route,
error handling). Findings for those modules below are provisional.

Endpoint existence checked against the live OpenAPI spec at `api.jinanam.org`.

---

## 1. Headline findings

**Three of the four login methods should be deleted, not built.** §4.2.2 specifies exactly
two: Mobile + OTP (primary) and Mobile + Password (secondary). Google, Apple and Email OTP
are neither in the spec nor on the API (`/auth/google`, `/auth/login/email`,
`/auth/email/otp/*` return 404). This also closes the earlier Android question — Google
Sign-In was never in scope.

**Member linking (§4.15) is the biggest gap, and it blocks personalisation.** The spec
requires a structured link model:

| Entity | Required | Optional |
|---|---|---|
| Temple / Dharamshala | 1 default (Jain Music Fest, auto-linked to every member) + 1 mandatory primary | 2 primary, up to 6 secondary |
| Monk | 1 primary | 9 secondary |

The API only has flat `POST /monks/{id}/follow` and `POST /temples/{id}/follow` — **no
primary/secondary tiering, no counts, no default link**. §4.3.4, §4.11 and §4.17 all
depend on this for feed personalisation and notification targeting ("if 250 members are
registered and only 100 are linked with ABC monk, send to those 100"). Without tiering,
targeted notifications cannot be implemented as specified.

**Most other endpoints already exist.** `/calendar/today` (Tithi), `/feed/`,
`/polls/{id}/vote`, `/notifications/my`, `/family/`, `/tracking/*`,
`/volunteers/opportunities`, `/temples/{id}/gallery` are all live. The nine hardcoded
pages are wiring work, not backend work.

---

## 2. Module-by-module

| § | Module | Spec requires | Today | Endpoint | Exists |
|---|---|---|---|---|---|
| 4.2 | Auth | Mobile+OTP, Mobile+Password only | 4 methods, 3 dead | `/auth/otp/*`, `/auth/login/password` | ✅ |
| 4.2.5 | First-time flow | OTP verify → profile creation | Not built | `/members/register/jain` | ✅ |
| 4.2.6 | Profile fields | Name, mobile, WhatsApp, country, city, state, area, community | Partial | `/members/me` | ✅ |
| 4.2.7 | Family addition | Add name+mobile, SMS/WhatsApp invite | Not built | `/family/`, `/family/link` | ✅ |
| 4.2.8 | Profile rules | Edit yes, delete never (Super Admin only) | Not enforced | `PATCH /members/me` | ✅ |
| 4.3.2 | Dashboard | Monk tracking, events, announcements, feed preview, Today's Tithi | 7 calls, wrong shape | `/dashboard/member`, `/calendar/today` | ✅ |
| 4.3.3 | Priority order | Alerts → Monks → Events → Announcements → Feed | Not implemented | — | n/a |
| 4.3.4 | Personalisation | By linked temples + active monks | Not implemented | **linking tiers** | ❌ |
| 4.4.2 | Monk tracking | **Map view** + list view | List only, `DEMO_MS` | `/tracking/pings`, `/monks/` | ✅ |
| 4.4.3 | Status colours | Green moving / yellow idle / red offline | Not implemented | `/tracking/*` | ✅ |
| 4.4.6 | Join Monk | Notify + join if within radius | Not built | **none found** | ❌ |
| 4.5.2 | Temple listing | Search + filter by city/state | Hardcoded | `/temples/` | ✅ |
| 4.5.3 | Temple profile | Dhaja (last/next by member), bank/UPI, gallery, events, tours | **Page does not exist** | `/temples/{id}`, `/gallery` | ✅ |
| 4.6.3 | Booking flow | 10 steps, proof upload, admin verify | Partial | `/bookings/`, `/payment-proof` | ✅ |
| 4.6.5 | Payment window | **1 hour then auto-cancel** | Not implemented | server-side job | ❌ |
| 4.7.2 | Event visibility | Temple-specific (linked only) vs public | Not implemented | **linking tiers** | ❌ |
| 4.7.6 | Capacity | Disable RSVP when full, show waitlist | Not implemented | `/events/{id}/rsvp` | ⚠️ partial |
| 4.8 | Paid events | Gateway, ticket, unique non-reusable QR | Not built | `/tickets/events/{id}/purchase` | ✅ |
| 4.9.3 | Tours | RSVP, Confirmed/Waiting/Cancelled | Hardcoded | `/tours/` | ✅ |
| 4.10.3 | Volunteers | Apply, Applied/Approved/Rejected | **No page at all** | `/volunteers/opportunities` | ✅ |
| 4.11.2 | Feed | Temple + monk + system + sponsored | Hardcoded | `/feed/` | ✅ |
| 4.11.4 | Polls | One vote, no change after submit | **Not built** | `/polls/{id}/vote` | ✅ |
| 4.13 | Gallery | Images/videos | Not built | `/temples/{id}/gallery` | ✅ |
| 4.14 | Announcements | From linked temples, priority | Not built | `/announcements/` | ✅ |
| 4.15 | Member linking | Tiered primary/secondary | **Not built** | **no tiered route** | ❌ |
| 4.16.3 | Donations | Ref no, proof, **multi-category split**, totals must match | Partial | `/donations/upload-proof` | ✅ |
| 4.16.6 | Receipts | Reg no, member no, 80G flag, signatory, stamp | Not built | `/receipts/my` | ✅ |
| 4.17.2 | Notifications | In-app, push, WhatsApp, SMS fallback | In-app only, hardcoded | `/notifications/my` | ✅ |
| 4.21.9 | Calendar | Today's Tithi + monthly view, per calendar type | Not built | `/calendar/today`, `/calendar/types` | ✅ |
| 4.21.8 | Calendar pref | Chosen at profile creation, changeable | Not built | **none found** | ❌ |

---

## 3. Backend work required

Everything else is frontend. These cannot be built from the client:

1. **Tiered member linking** (§4.15) — primary/secondary for temples and monks, with the
   1+2+6 and 1+9 limits, plus the default Jain Music Fest link. Blocks §4.3.4, §4.7.2,
   §4.11 and §4.17 targeting.
2. **Booking payment window** (§4.6.5) — 1-hour auto-cancel that releases the slot.
   Needs a server-side job; a client timer cannot be trusted.
3. **Calendar preference** (§4.21.8) — store the member's calendar type and drive the
   daily Tithi notification from it.
4. **Join Monk radius** (§4.4.6) — proximity check and notify.
5. **Booking waiting list** — already flagged; no route exists.
6. **`/donations/targets`** — already flagged; no route exists.

---

## 4. Recommended build order

| Phase | Work | Depends on |
|---|---|---|
| 2 | Auth: delete 3 dead methods, add profile creation + family addition | — |
| 3 | Home rebuilt to §4.3 priority order + Today's Tithi | `/calendar/today` |
| 4 | Wire 9 hardcoded pages to live endpoints | — |
| 5 | New pages: temple detail (§4.5), polls (§4.11.4), volunteers (§4.10), gallery, announcements | — |
| 6 | Monk map view + status colours (§4.4) | `/tracking/*` |
| 7 | Linking UI, event visibility, notification targeting | **backend item 1** |

Phases 2–6 are unblocked and account for most of the panel. Phase 7 waits on the tiered
linking model.
