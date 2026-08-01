# JiNANAM — Members Panel Backend Reference

Complete API, data-structure, form and lifecycle specification for building the
**Member App** (Android + Web). This is the client-facing (member) surface of the
JiNANAM platform — the same backend also powers an admin panel; admin-only routes
are listed at the end for completeness but are **not** part of the member app.

> Source of truth: the live OpenAPI spec at
> `https://api.jinanam.org/api/docs` (`/api/docs.json`), the deployed validation
> contracts (probed live), and the existing web `src/` implementation.
> Verified against deployment `1.0.0`, environment `development`, 2026-08-01.

---

## 1. Environment & Base Configuration

| Key | Value |
|-----|-------|
| `REACT_APP_API_BASE_URL` | `https://api.jinanam.org/api/v1` |
| `REACT_APP_STATIC_URL` | `https://api.jinanam.org/static` |
| `REACT_APP_SOCKET_URL` | `https://api.jinanam.org` |
| Swagger UI | `https://api.jinanam.org/api/docs` |
| OpenAPI JSON | `https://api.jinanam.org/api/docs.json` |
| Health | `https://api.jinanam.org/health` |

- **All API paths below are relative to `…/api/v1`.** e.g. `/auth/me` → `https://api.jinanam.org/api/v1/auth/me`.
- **Static assets** (photos, logos, proofs, QR) are served from `…/static/…`. When an API returns a relative path, prefix it with `REACT_APP_STATIC_URL`.
- **Realtime**: Socket.IO server at `REACT_APP_SOCKET_URL` (used for notifications, live tracking, seating locks).

### Android configuration equivalent

```kotlin
object Env {
    const val API_BASE   = "https://api.jinanam.org/api/v1/"
    const val STATIC_URL = "https://api.jinanam.org/static/"
    const val SOCKET_URL  = "https://api.jinanam.org"
}
```

---

## 2. Response Envelope & Errors

**Every** endpoint returns the same envelope:

```jsonc
{
  "success": true,
  "data":   { /* payload — object OR array, may be null */ },
  "meta":   { /* pagination / totals, may be null */ },
  "error":  null
}
```

On failure:

```jsonc
{
  "success": false,
  "data": null,
  "meta": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "fieldErrors": {                 // present only for 422
      "body.mobile": ["Required"],
      "body.purpose": ["Required"]
    }
  }
}
```

### Client unwrap rule
Always read `response.data.data`. If `data` has an `items` array, that is the list; `meta`/`totals` carry pagination and aggregates. (The web client's `unwrap()` tolerates both `{data:{...}}` and a bare payload.)

### HTTP status → error code

| HTTP | `error.code` | Meaning | Client action |
|------|--------------|---------|---------------|
| 400  | `BAD_REQUEST` | Malformed request | Fix payload |
| 401  | `UNAUTHORIZED` | Missing/expired bearer token | Refresh, then re-login |
| 403  | `FORBIDDEN` | Tenant / permission scope violation | Hide feature |
| 404  | `NOT_FOUND` | Route or resource missing | Show empty state |
| 409  | `CONFLICT` | Duplicate / state clash (e.g. already RSVP'd) | Show message |
| 422  | `VALIDATION_ERROR` | Field validation failed | Map `fieldErrors` to inputs |
| 429  | `RATE_LIMITED` | Too many OTP/login attempts | Backoff timer |
| 500  | `INTERNAL` | Server error | Retry / report |

Field-error keys are dot-paths (`body.<field>`, `query.<field>`, `params.<field>`). Strip the `body.`/`query.` prefix to map onto form inputs.

---

## 3. Authentication & Session Lifecycle

Auth is **bearer-token** (`Authorization: Bearer <accessToken>`). The platform issues an **access token** (short-lived JWT) and a **refresh token** (long-lived). Nearly every endpoint (including public-looking GETs like `/search`, `/master-data/*`, `/calendar/today`, `/events`) requires a valid bearer token — the app must authenticate before rendering any real content.

### 3.1 Token storage keys (web reference — mirror these in Android secure storage)

| Purpose | Web (`localStorage`) | Android (recommended) |
|---------|----------------------|------------------------|
| Access token | `jinanam_access_token` | `EncryptedSharedPreferences` |
| Refresh token | `jinanam_refresh_token` | `EncryptedSharedPreferences` |
| User object | `jinanam_user` | `EncryptedSharedPreferences` / Room |
| Device id | `jinanam_device_id` | Generate once, persist (`web-…` / `android-<uuid>`) |

**Device id**: generate a stable UUID once per install and send it on every auth call. Web uses `web-<uuid>`; Android should use `android-<uuid>`.

### 3.2 Auth endpoints (member-relevant)

All under `/auth`. Request bodies are JSON unless noted.

| # | Method | Path | Purpose |
|---|--------|------|---------|
| 1 | POST | `/auth/otp/request` | Request mobile OTP (login or register) |
| 2 | POST | `/auth/otp/verify` | Verify mobile OTP → tokens |
| 3 | POST | `/auth/email/otp/request` | Request email OTP |
| 4 | POST | `/auth/email/otp/verify` | Verify email OTP → tokens |
| 5 | POST | `/auth/login/password` | Mobile + password login |
| 6 | POST | `/auth/login/email` | Email + password login |
| 7 | POST | `/auth/google` | Google sign-in / sign-up |
| 8 | POST | `/auth/refresh` | Exchange refresh token for new access token |
| 9 | POST | `/auth/logout` | Revoke device session (needs bearer) |
| 10 | GET | `/auth/me` | Current user profile |
| 11 | GET | `/auth/me/modules` | Granted modules + permissions (admins/staff) |

> Note on staff/admin-only auth routes (`/auth/admins*`, `/auth/promote-sa`): not part of the member app.

#### 3.2.1 `POST /auth/otp/request`
**Required body** (verified live): `mobile`, `purpose`.

```jsonc
{ "mobile": "+919999900000", "purpose": "LOGIN" }   // purpose: "LOGIN" | "REGISTER"
```
Response `data`: `{ "requestId": "...", "expiresIn": 300, "channel": "MSG91" }` (OTP delivered via MSG91 SMS).

#### 3.2.2 `POST /auth/otp/verify`
**Required body**: `mobile`, `otp`, `purpose`. Send `deviceId`, `deviceType` too.

```jsonc
{
  "mobile": "+919999900000",
  "otp": "123456",
  "purpose": "LOGIN",              // or "REGISTER"
  "deviceId": "android-<uuid>",
  "deviceType": "ANDROID"          // "WEB" | "ANDROID" | "IOS"
}
```
Response `data` (login): `{ userId, publicId, role, accessToken, refreshToken }` — optionally a full `user` object.
Response `data` (register purpose, new number): `{ registrationToken, ... }` — carry `registrationToken` into the registration call (§4).

#### 3.2.3 `POST /auth/login/password`
**Required body**: `mobile`, `password`.
```jsonc
{ "mobile": "+919999900000", "password": "•••", "deviceId": "android-<uuid>", "deviceType": "ANDROID" }
```

#### 3.2.4 `POST /auth/login/email`
**Required body**: `email`, `password`.
```jsonc
{ "email": "user@example.com", "password": "•••", "deviceId": "…", "deviceType": "ANDROID" }
```

#### 3.2.5 `POST /auth/email/otp/request` / `verify`
- request **required body**: `email`.
- verify **required body**: `email`, `otp` (+ `deviceId`, `deviceType`).

#### 3.2.6 `POST /auth/google`
**Required body**: `email` (plus the Google identity fields).
```jsonc
{
  "email": "user@gmail.com",
  "googleId": "…", "firstName": "…", "lastName": "…", "photoUrl": "…",
  "deviceId": "android-<uuid>", "deviceType": "ANDROID"
}
```

#### 3.2.7 `POST /auth/refresh`
**Required body**: `refreshToken`.
```jsonc
{ "refreshToken": "<token>" }
```
Response `data`: `{ accessToken, refreshToken? }`. Rotate stored tokens on success.

#### 3.2.8 `POST /auth/logout`
Requires bearer token. Body: `{ "deviceId": "android-<uuid>" }`. Clears server-side device session.

**Common login/token success shape** (all six flows normalize to this):
```jsonc
{
  "userId":  "cms4y…",
  "publicId": "JFJM108",
  "role":    "MEMBER",           // primaryRoleKey
  "accessToken":  "<jwt>",
  "refreshToken": "<jwt>"
  // some deployments also return a full "user": {…}
}
```

### 3.3 Token refresh lifecycle (interceptor pattern)

```
request → attach Bearer <access>
   └─ 401 UNAUTHORIZED (first time only)
        └─ POST /auth/refresh { refreshToken }
             ├─ success → store new access(+refresh), replay original request once
             └─ failure → wipe tokens, emit "unauthorized" → route to Login
```
- Single-flight the refresh call (one in-flight promise shared by concurrent 401s).
- Mark the retried request so a second 401 does **not** loop; it logs out instead.

### 3.4 `GET /auth/me`
Returns the authenticated user. Web merges this into the stored user object.
```jsonc
{
  "id": "cms4y…", "userId": "cms4y…", "publicId": "JFJM108",
  "firstName": "…", "lastName": "…", "photoUrl": "/static/…",
  "mobile": "+9199…", "email": "…",
  "primaryRoleKey": "MEMBER",
  "organizationIds": [], "permissions": { }, "modules": []
}
```
For a pure member, `primaryRoleKey` is `MEMBER` and `permissions`/`modules` are empty — the member app does not gate on modules (that is the admin panel's mechanism).

---

## 4. Registration Lifecycle

Two member categories, each with its own creation endpoint:

| Method | Path | Category |
|--------|------|----------|
| POST | `/members/register/jain` | Jain member → ID pattern `JFJM…` |
| POST | `/members/register/non-jain` | Non-Jain member → ID pattern `JFNJM…` |

> Both require a bearer token: registration runs **after** a `purpose: "REGISTER"` OTP verify returns a session/registration token. Flow: verify mobile → obtain token → submit the category registration. (The legacy web helper posts a single `/auth/register`; the live backend uses the two `/members/register/*` routes above — prefer these.)

### 4.1 Four-step registration wizard (web `MemberRegisterPage`)

| Step | Title | Fields | API |
|------|-------|--------|-----|
| 0 | Verify Mobile | `mobile` → OTP → 6-digit `otp` | `/auth/otp/request` (purpose `REGISTER`), `/auth/otp/verify` |
| 1 | Member Type | `JAIN` \| `NON_JAIN` | — (local) |
| 2 | Profile & Identity | see below | — (local) |
| 3 | Consents & ID Generation | consent checkboxes | `/members/register/{jain\|non-jain}` |

### 4.2 Registration payload (fields)

Common:
```jsonc
{
  "registrationToken": "<from OTP verify>",
  "firstName": "…", "middleName": "…", "surname": "…",
  "fullName":  "First Middle Surname",     // derived
  "gender": "Male | Female",
  "dob": "YYYY-MM-DD",
  "age": 34,                                // derived
  "isSeniorCitizen": false,                 // derived: age >= 59
  "country": "India",
  "currency": "INR (₹)",                    // derived from country
  "mobile": "+9199…",
  "memberType": "JAIN | NON_JAIN",
  "motherTongue": "Gujarati",
  "tithiCalendar": "Gujarati",
  "city": "Mumbai", "state": "Maharashtra", "area": "Thane West",
  "consentTerms": true, "consentPrivacy": true,
  "consentServices": true, "consentPromotional": true
}
```

**Jain-only** (send when `memberType = JAIN`):
```jsonc
{
  "sect": "Shwetambar | Digambar",
  "subCommunity": "Murtipujak (Deravasi / Mandirmargi) | Sthanakvasi | Terapanth",
  "gaccha": "Tapa Gaccha"   // only when subCommunity contains "Murtipujak"; 75+ options
}
```

**Non-Jain-only** (send when `memberType = NON_JAIN`):
```jsonc
{
  "govDocuments": [
    { "type": "Aadhaar Card", "number": "…" },
    { "type": "PAN Card", "number": "…" }
  ],
  "interests": ["Room Bookings", "Bhojanshala", "Donations"]
}
```

### 4.3 Reference master lists (client-side, mirror in Android)

- **Sect**: `Shwetambar`, `Digambar`
- **Sub-community**: `Murtipujak (Deravasi / Mandirmargi)`, `Sthanakvasi`, `Terapanth`
- **Gaccha (75+)**: Tapa, Achal, Kharatara, Upkeśa, Jiravala, Lonka (Richmati), … Namila (full list in `MemberRegisterPage.jsx` / fetch via `GET /master-data/gacchas`).
- **Gov ID types**: `Aadhaar Card`, `PAN Card`, `Passport`, `Driving Licence`, `Voter ID`, `Other Gov ID`
- **Non-Jain interests**: Temple Visits, Spiritual Learning, Events, Tours, Room Bookings, Hall Bookings, Bhojanshala, Volunteering, Donations, Charity Activities, Religious Tourism
- **Country → currency**: India→INR(₹), UK→GBP(£), US→USD($), Canada→CAD(C$), Australia→AUD(A$), UAE→AED, Singapore→SGD(S$), Kenya→KES, South Africa→ZAR
- Derived business rules: `isSeniorCitizen = age ≥ 59`; guardian consent required when `0 < age < 18`.

### 4.4 Registration response
```jsonc
{ "publicId": "JFJM108", "memberId": "JFJM108", "status": "ACTIVE", "…": "…" }
```
Display the generated **Unique Member ID** (`JFJM…` for Jain, `JFNJM…` for Non-Jain), then route to Home.

---

## 5. Login & Registration Form Specification (UI contract)

### 5.1 Login screen
Two modes + social:

| Mode | Fields | Submit endpoint |
|------|--------|-----------------|
| Password | `identifier` (email **or** mobile), `password`, `rememberMe` | contains `@` → `/auth/login/email`, else `/auth/login/password` |
| Mobile OTP | `mobile` → `otp` (6 digit) | `/auth/otp/request` then `/auth/otp/verify` (purpose `LOGIN`) |
| Google | OAuth | `/auth/google` |
| Apple | OAuth (configured) | (client SDK → backend) |

- Client decides email vs mobile by presence of `@` in `identifier`.
- "Forgot Password" currently triggers a reset link toast (no dedicated endpoint in v1).
- On success → navigate to `/member/home`.

### 5.2 Register screen
See §4.1–4.2. Progress bar over the 4 steps; consent gating enforced client-side before submit.

---

## 6. Member App Feature Map (screen → route → endpoints)

Web member routes live under `/member/*` inside `MemberLayout`. Android should mirror these as screens.

| Screen | Web route | Primary endpoints |
|--------|-----------|-------------------|
| Home / Dashboard | `/member/home` | `GET /dashboard/member`, `/events?take=4`, `/feed?take=4`, `/news?take=4`, `/offers?take=4`, `/temples?take=4`, `/monks?take=4` |
| Feed | `/member/feed` | `GET /feed/`, post interactions |
| Offers | `/member/offers` | `GET /offers/browse`, save/track |
| Explore | `/member/explore` | `GET /search/`, temples/monks/dharamshalas listing |
| Spiritual | `/member/spiritual` | `GET /calendar/today`, `/calendar/month`, counters |
| Profile | `/member/profile` | `GET/PATCH /members/me`, `POST /members/me/location`, community switch |
| Digital ID | `/member/digital-id` | `GET /members/me/qr` |
| News | `/member/news` | `GET /news/`, bookmarks |
| Monks (MS) | `/member/ms`, `/member/ms/:id` | `GET /monks/`, `/monks/{id}`, follow |
| Temples | `/member/temples` | `GET /temples/`, `/temples/{orgId}`, follow |
| Tours | `/member/tours` | `GET /tours/`, `/tours/{id}` |
| Events | `/member/events` | `GET /events/`, `/events/member`, rsvp |
| Bookings | `/member/bookings`, `/member/bookings/:uid` | `GET /bookings/my`, `/bookings/{id}`, proof/cancel |
| Donations | `/member/donations` | `GET /donations/my`, `/donations/manual`, proof |
| Tickets | `/member/tickets` | `GET /tickets/my` |
| Wallet | `/member/wallet` | `GET /receipts/my`, `/counters/my` |
| Notifications | `/member/notifications` | `GET /notifications/my`, preferences |
| Support | `/member/support` | `GET/POST /support-tickets`, `/feedback` |

---

## 7. Member-Facing API Catalogue (by domain)

Legend: **Auth** = bearer required (default: yes). Query params are `?key=value`.
Paths are relative to `/api/v1`.

### 7.1 Identity & Profile — `/members`, `/auth`

| Method | Path | Purpose | Body / Params |
|--------|------|---------|---------------|
| GET | `/auth/me` | Session user | — |
| GET | `/members/me` | Full member profile | — |
| PATCH | `/members/me` | Update profile | partial member fields |
| PATCH | `/members/me/community-switch` | Switch active community | `{ sect, subCommunity, gaccha }` |
| POST | `/members/me/location` | Update current location (drives Visibility Engine) | `{ lat, lng, city, area, state }` |
| GET | `/members/me/qr` | Digital ID QR token/image | — |
| GET | `/members/{publicId}` | Public member profile | path `publicId` (e.g. `JFJM108`) |
| POST | `/members/{publicId}/photo` | Upload profile photo | multipart `photo` |

Member object (from web usage): `publicId`, `firstName`/`middleName`/`surname`/`fullName`, `gender`, `dob`, `age`, `isSeniorCitizen`, `photoUrl`, `mobile`, `email`, `memberType`, `sect`, `subCommunity`, `gaccha`, `motherTongue`, `tithiCalendar`, `country`, `currency`, `city`/`state`/`area`, `interests[]`, `govDocuments[]`, `status`.

### 7.2 Home / Dashboard — `/dashboard`

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/dashboard/member` | Member home aggregate (greeting, quick stats, cards) |
| GET | `/dashboard/deep-link/{publicId}` | Resolve a scanned/shared entity id to its screen |
| GET | `/dashboard/rating-prompt` | Whether to show app-rating prompt |
| POST | `/dashboard/rating-prompt` | Record rating-prompt response |

### 7.3 Feed — `/feed`

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/feed/` | Personalized feed (sort via Visibility Engine) |
| GET | `/feed/posts/{postId}` | Post detail |
| POST | `/feed/posts/{postId}/bookmark` / DELETE | Bookmark / remove |
| POST | `/feed/posts/{postId}/click` | Track click |
| POST | `/feed/posts/{postId}/share` | Track share |
| POST | `/feed/polls/{pollId}/vote` | Vote on a feed poll — `{ optionId }` |
| POST | `/feed/posts/{postId}/poll` | (poll interaction) |
| POST | `/feed/posts` | Create post (if member posting enabled) |

### 7.4 Events — `/events`, `/tickets`, `/seating`

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/events/` | Browse events (`?scope=upcoming\|today\|past&category=&lat=&lng=`) |
| GET | `/events/member` | My events (RSVP'd / attended / ticketed) |
| GET | `/events/{eventId}` | Event detail |
| POST | `/events/{eventId}/rsvp` | RSVP — `{ attendees }` or `{ member_ids: [] }` |
| POST | `/events/{eventId}/rsvp/cancel` | Cancel RSVP (promotes waiting list) |
| GET | `/events/{eventId}/feedback` / POST | Read / submit event feedback |
| POST | `/tickets/events/{eventId}/purchase` | Buy ticket(s) — `{ categoryId, quantity, attendees[] }` |
| GET | `/tickets/my` | My tickets (includes signed QR token) |
| GET | `/tickets/{ticketPublicId}/download` | Ticket PDF/QR |
| GET | `/tickets/{ticketPublicId}/history` | Ticket status history |
| GET | `/seating/event/{eventId}` / `/seating/events/{eventId}/seat-map` | Seat map |
| POST | `/seating/seats/{seatId}/lock` / `/release` | Hold / release a seat during checkout |

### 7.5 Bookings (Dharamshala rooms, halls, pooja) — `/bookings`

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/bookings/` | Create a booking request |
| GET | `/bookings/my` | My bookings (unified) |
| GET | `/bookings/{bookingId}` | Booking detail + status timeline |
| GET | `/bookings/items/{itemId}/availability` | Availability calendar for a bookable item |
| POST | `/bookings/{bookingId}/payment-proof` | Upload payment proof (multipart `proof`, `reference`, `notes`) |
| POST | `/bookings/{bookingId}/extend-stay` | Request stay extension |

Booking lifecycle statuses (drive `StatusTimeline`): `REQUESTED → APPROVED/REJECTED → PAYMENT_PENDING → PAYMENT_SUBMITTED → CONFIRMED → CHECKED_IN → CHECKED_OUT` (with `CANCELLED`, `WAITLISTED`). Member Phase-1 cancel is **request-only** — admin approves.

### 7.6 Donations — `/donations`, `/receipts`

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/donations/my` | My donation history (+ FY totals in `meta`/`totals`) |
| POST | `/donations/manual` | Record a manual/bank/UPI donation intent → transfer instructions. `{ institution_id, category_id, amount_minor, currency, note }` |
| POST | `/donations/platform` | Platform (JiNANAM Foundation) donation |
| POST | `/donations/upload-proof` | Upload transfer proof (multipart) |
| GET | `/donations/campaign-config/{flowType}` | Campaign/flow configuration |
| GET | `/receipts/my` | My donation/payment receipts (80G) |

**Money rule**: amounts are **integer minor units** (paise) with an explicit `currency`; never floats. Format only at the UI edge.

### 7.7 Temples / Monks / Dharamshalas / Jain Centers (directory + follow)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/temples/` | List/search temples |
| GET | `/temples/{organizationId}` | Temple detail |
| GET | `/temples/{organizationId}/structure` | (dharamshala) building/wing/room structure |
| POST | `/temples/{organizationId}/follow` / `/unfollow` | Follow toggle |
| POST | `/temples/{organizationId}/reviews` | Post a review |
| POST | `/temples/{organizationId}/report-incorrect-info` | Report incorrect info |
| GET | `/temples/bhojanalay-directory` | Bhojanshala directory |
| GET | `/monks/` , `/monks/{monkId}` | Monk (MS) list / detail |
| POST | `/monks/{monkId}/follow` / `/unfollow` | Follow toggle |
| GET | `/dharamshalas/` , `/dharamshalas/{organizationId}` | Dharamshala list / detail |
| POST | `/dharamshalas/{organizationId}/follow` / `/unfollow` | Follow toggle |
| POST | `/dharamshalas/{organizationId}/reviews` | Review |
| GET | `/jain-centers/` , `/jain-centers/{organizationId}` | Jain Center list / detail |
| POST | `/jain-centers/{organizationId}/follow` / `/unfollow` | Follow toggle |
| GET | `/chaturmas/monk/{monkId}` | Monk's chaturmas records |
| GET | `/gallery/org/{organizationId}` , `/gallery/albums/org/{organizationId}` | Org photo gallery |

Entity public-id prefixes seen in the app: `JFJT…` (temple), `JFMS…` (monk), `JFD…` (dharamshala), `JFJC…` (Jain Center), `JFJM…`/`JFNJM…` (member).

### 7.8 Tours (99 Yatra etc.) — `/tours`

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/tours/` , `/tours/{tourId}` | Tour list / detail |
| GET | `/tours/participants/{participantId}` | My participant record |
| GET | `/tours/participants/{participantId}/milestones` | Jatra milestones |
| GET | `/tours/{tourId}/participants/{participantId}/certificate` | Completion certificate |
| PUT | `/tours/participants/{participantId}/medical-form` | Submit medical form |

### 7.9 News — `/news`

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/news/` | News list |
| GET | `/news/bookmarks/my` | My bookmarked news |
| POST | `/news/{newsId}/bookmark` / `/unbookmark` | Bookmark toggle |

### 7.10 Offers — `/offers`

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/offers/browse` | Member-facing offers |
| POST | `/offers/{offerId}/save` / `/unsave` | Save toggle |
| POST | `/offers/{offerId}/track/{kind}` | Track view/click/redeem (`kind`) |

### 7.11 Notifications — `/notifications`, `/devices`

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/notifications/my` | My notifications (`?unread=true`, pagination in `meta`) |
| POST | `/notifications/{notificationId}/opened` | Mark opened |
| GET | `/notifications/preferences` / PUT | Read / update channel preferences |
| GET | `/devices/` , POST `/devices/` | Register push device (`{ token, platform, deviceId }`) |

Realtime pushes also arrive over Socket.IO (`REACT_APP_SOCKET_URL`). Register the FCM token via `POST /devices/` for background push.

### 7.12 Support & Feedback — `/support-tickets`, `/feedback`, `/incorrect-reports`

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/support-tickets/` | Raise a support ticket |
| GET | `/support-tickets/my` | My tickets |
| POST | `/feedback/` | Submit feedback |
| POST | `/incorrect-reports/` | Report incorrect data |

### 7.13 Spiritual — Calendar, Counters, Polls, Community Pages

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/calendar/today` | Today's tithi / festivals |
| GET | `/calendar/month?year=&month=` | Month calendar |
| GET | `/calendar/types` | Calendar types (Gujarati/etc.) |
| PATCH | `/calendar/my-calendar` | Personal calendar prefs |
| GET | `/counters/my` | My spiritual counters (jaap/tapasya) |
| POST | `/counters/delta` | Increment a counter — `{ counterId, delta }` |
| GET | `/counters/leaderboard` | Leaderboard |
| GET | `/community-pages/` , `/community-pages/{pageId}` | Community pages |
| GET | `/community-pages/{pageId}/feed` | Page feed |
| POST | `/community-pages/{pageId}/join` / `/leave` | Membership |
| POST | `/community-pages/{pageId}/posts` | Post to a page |
| POST | `/polls/{pollId}/vote` | Vote — `{ optionId }` |
| GET | `/polls/{pollId}/results` | Poll results |

### 7.14 Family — `/family`

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/family/my` | My family tree / links |
| POST | `/family/` | Add a family member |
| POST | `/family/link` | Link to an existing member |
| DELETE | `/family/{linkId}` | Remove a link |

### 7.15 Volunteering & Visitors

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/volunteers/opportunities` | Browse volunteering opportunities |
| POST | `/volunteers/opportunities/{opportunityId}/apply` | Apply |
| POST | `/visitors/check-in` | Self visitor check-in (QR) |
| POST | `/visitors/check-out/{entryId}` | Check-out |
| GET | `/visitors/my-history` | My visit history |

### 7.16 Search & Discovery — `/search`

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/search/?q=&type=` | Global search (temples, monks, members, dharamshalas, events…) |

### 7.17 Uploads & Master Data

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/uploads/` | Generic file upload (multipart) → returns stored URL |
| GET | `/master-data/{listKey}` | Fetch a master list (`gacchas`, `sub-communities`, `bhagwans`, `pathshala-centers`, …) |
| GET | `/master-data/gacchas` | Gaccha list (75+) |
| GET | `/master-data/sub-communities` | Sub-community list |
| GET | `/master-data/bhagwans` | Tirthankar list |

---

## 8. Wallet & Digital ID

- **Digital ID** (`/member/digital-id`): `GET /members/me/qr` returns the member's QR token (used at temple/dharamshala/event check-in). Render as a QR; the same token is validated by staff scanners (`/tickets/scan`, `/visitors/*`).
- **Wallet** (`/member/wallet`): aggregate of `GET /receipts/my` (payment/donation receipts) + `GET /counters/my` (spiritual counters). No stored-value/payment wallet in v1 — it is a records wallet.

---

## 9. Visibility & Sorting Engine (client-side ranking)

The app re-orders content by community + location + follow relationship. Implement identically on Android to keep parity. Priority (lower = higher rank):

| Priority | Rule |
|----------|------|
| 1 | Followed entity (temple / monk / dharamshala / JC / page) |
| 2 | Same community **and** current area |
| 3 | Same community **and** city / nearby |
| 4 | Same community **and** state |
| 5 | Same community **and** country |
| 6 | Other communities (search-discovery only) |

- **Dharamshalas** are a common facility → treated as community-match for everyone.
- Inputs: user prefs (`sect`, `subCommunity`, `city`, `area`, `state`, `country`), the followed-id set, and an optional **travel location** override (when the member is travelling, city/area/state are swapped to the travel location).
- Persisted client-side keys (web): `jinanam_user_community_prefs`, `jinanam_followed_entities`. On Android store equivalently and sync follows via the `follow`/`unfollow` endpoints.

Pseudocode:
```
priority(item):
  if item is Dharamshala: communityMatch = true
  if item.id in followed or item.isFollowed: return 1
  if item.sect != user.sect and not Dharamshala: return 6
  if user.area  in item.area:  return 2
  if user.city  in item.city:  return 3
  if user.state in item.state: return 4
  return 5
sort(items) by priority asc
```

---

## 10. End-to-End Lifecycles

### 10.1 Cold start → authenticated home
```
1. App launch → read stored access/refresh tokens
2. If access present: GET /auth/me (attach Bearer)
      ├─ 200 → hydrate user → route Home
      └─ 401 → POST /auth/refresh → retry /auth/me → else Login
3. If no token → Login screen
4. Home: GET /dashboard/member  (+ parallel /events,/feed,/news,/offers,/temples,/monks ?take=4)
5. Register FCM: POST /devices/  { token, platform:"ANDROID", deviceId }
6. Connect Socket.IO for live notifications
```

### 10.2 Mobile-OTP login
```
POST /auth/otp/request {mobile,purpose:"LOGIN"}  → OTP via MSG91
POST /auth/otp/verify  {mobile,otp,purpose:"LOGIN",deviceId,deviceType}
   → {accessToken,refreshToken,userId,publicId,role}
store tokens → GET /auth/me → Home
```

### 10.3 Registration (new Jain member)
```
POST /auth/otp/request {mobile,purpose:"REGISTER"}
POST /auth/otp/verify  {mobile,otp,purpose:"REGISTER",...} → {registrationToken}
[collect profile + Jain community + consents]
POST /members/register/jain  {registrationToken, ...payload}
   → {publicId:"JFJM108"} → show Unique ID → Home
```

### 10.4 Room booking
```
GET /dharamshalas/{orgId}/structure           → pick room/item
GET /bookings/items/{itemId}/availability      → pick dates
POST /bookings/ {itemId,checkIn,checkOut,guests,...}   → REQUESTED
(admin approves) → PAYMENT_PENDING
POST /bookings/{id}/payment-proof (multipart)  → PAYMENT_SUBMITTED
(admin verifies) → CONFIRMED → GET /bookings/{id} shows timeline
```

### 10.5 Event RSVP + ticket
```
GET /events/?scope=upcoming → GET /events/{id}
POST /events/{id}/rsvp {attendees} | {member_ids:[]}
(paid) POST /tickets/events/{id}/purchase {categoryId,quantity,attendees}
GET /tickets/my → GET /tickets/{ticketPublicId}/download (QR)
```

### 10.6 Donation
```
GET /donations/campaign-config/{flowType}   (targets, categories, bank/UPI/QR)
POST /donations/manual {institution_id,category_id,amount_minor,currency,note}
   → transfer instructions
POST /donations/upload-proof (multipart)
GET /donations/my → history + FY totals ; GET /receipts/my → 80G receipt
```

---

## 11. Android Implementation Notes

- **Networking**: Retrofit + OkHttp. Add an `Authorization` interceptor and an `Authenticator` implementing the §3.3 single-flight refresh. Base URL `https://api.jinanam.org/api/v1/`.
- **Envelope**: wrap all responses in `Envelope<T>{ success, data, meta, error }`; a shared `CallAdapter`/mapper unwraps `data` and throws a typed `ApiException(code, message, fieldErrors)` on `success=false`.
- **Token storage**: `EncryptedSharedPreferences` for access/refresh/deviceId/user.
- **Device**: `deviceType = "ANDROID"`, `deviceId = "android-<uuid>"` generated once.
- **Push**: FCM token → `POST /devices/`; also open a Socket.IO connection with the bearer token for foreground realtime.
- **Multipart**: bookings/donations proof and photos use `multipart/form-data` (`proof`, `photo`, `reference`, `notes`).
- **Money**: keep amounts as `Long` minor units; format with `NumberFormat.getCurrencyInstance` at display time only.
- **Images**: prefix relative paths with `STATIC_URL`.
- **Pagination**: pass `?take=` / `?skip=` (or `page`); read totals/cursors from `meta`.
- **Visibility engine**: port §9 verbatim; persist follows and community prefs locally, sync via follow endpoints.
- **Errors**: map `error.fieldErrors["body.<field>"]` onto form inputs; on 401 refresh-then-retry, on repeated 401 route to Login.

---

## 12. Complete Endpoint Index (all 380 routes)

Grouped by tag. **Member app uses the domains in §7**; the rest are admin/staff surfaces on the same backend, included here so both apps share one contract. `{…}` = path param.

<details>
<summary><b>auth (18)</b></summary>

- `GET /auth/admins` · `POST /auth/admins` · `DELETE /auth/admins/{userId}` · `PUT /auth/admins/{userId}/modules` · `PATCH /auth/admins/{userId}/organizations` · `PATCH /auth/admins/{userId}/status` *(admin)*
- `POST /auth/email/otp/request` · `POST /auth/email/otp/verify` · `POST /auth/google` · `POST /auth/login/email` · `POST /auth/login/password` · `POST /auth/logout` · `GET /auth/me` · `GET /auth/me/modules` · `POST /auth/otp/request` · `POST /auth/otp/verify` · `POST /auth/refresh` · `GET /auth/promote-sa` *(dev)*
</details>

<details>
<summary><b>members (18)</b></summary>

- `GET /members/` · `POST /members/admin-create` · `POST /members/bulk-import` · `POST /members/bulk-import/excel` · `GET /members/export` · `GET /members/import-template` *(admin)*
- `GET /members/me` · `PATCH /members/me` · `PATCH /members/me/community-switch` · `POST /members/me/location` · `GET /members/me/qr` · `POST /members/register/jain` · `POST /members/register/non-jain`
- `GET /members/{publicId}` · `PATCH /members/{publicId}` · `DELETE /members/{publicId}` · `POST /members/{publicId}/photo` · `PATCH /members/{publicId}/status`
</details>

<details>
<summary><b>dashboard (10)</b></summary>

`GET /dashboard/admin/{organizationId}` · `GET /dashboard/app-usage` · `GET /dashboard/deep-link/{publicId}` · `GET /dashboard/help` · `PUT /dashboard/help/{section}` · `GET /dashboard/member` · `GET /dashboard/platform` · `GET /dashboard/platform-stats` · `GET /dashboard/rating-prompt` · `POST /dashboard/rating-prompt`
</details>

<details>
<summary><b>bookings (21)</b></summary>

`POST /bookings/` · `GET /bookings/` · `DELETE /bookings/internal-reservations/{reservationId}` · `POST /bookings/items` · `GET /bookings/items/org/{organizationId}` · `PATCH /bookings/items/{itemId}` · `GET /bookings/items/{itemId}/availability` · `POST /bookings/items/{itemId}/blackout-dates` · `POST /bookings/items/{itemId}/internal-reservations` · `GET /bookings/my` · `GET /bookings/org/{organizationId}` · `GET /bookings/org/{organizationId}/export` · `PATCH /bookings/rooms/{roomId}/housekeeping` · `GET /bookings/{bookingId}` · `POST /bookings/{bookingId}/check-in` · `POST /bookings/{bookingId}/check-out` · `POST /bookings/{bookingId}/decision` · `POST /bookings/{bookingId}/extend-stay` · `POST /bookings/{bookingId}/payment-proof` · `POST /bookings/{bookingId}/payment-verification` · `POST /bookings/{bookingId}/transfer-room`
</details>

<details>
<summary><b>donations (11)</b></summary>

`GET /donations/` · `GET /donations/campaign-config/{flowType}` · `PATCH /donations/campaign-config/{flowType}` · `GET /donations/donor-lookup` · `POST /donations/manual` · `GET /donations/my` · `GET /donations/org/{organizationId}` · `GET /donations/org/{organizationId}/export` · `POST /donations/platform` · `POST /donations/upload-proof` · `POST /donations/{donationId}/decision`
</details>

<details>
<summary><b>events (21)</b></summary>

`GET /events/` · `POST /events/` · `GET /events/dashboard/org/{organizationId}` · `GET /events/dashboard/platform` · `GET /events/member` · `GET /events/monk/{monkId}` · `GET /events/org/{organizationId}` · `GET /events/reports/revenue/export` · `GET /events/{eventId}` · `PATCH /events/{eventId}` · `POST /events/{eventId}/cancel` · `POST /events/{eventId}/feedback` · `GET /events/{eventId}/feedback` · `POST /events/{eventId}/gallery` · `POST /events/{eventId}/rsvp` · `POST /events/{eventId}/rsvp/cancel` · `GET /events/{eventId}/rsvps` · `GET /events/{eventId}/rsvps/export` · `GET /events/{eventId}/tickets/export` · `POST /events/{eventId}/transition` · `POST /events/{eventId}/video-links`
</details>

<details>
<summary><b>tickets (9) · seating (8)</b></summary>

tickets: `GET /tickets/events/{eventId}/attendance` · `POST /tickets/events/{eventId}/categories` · `POST /tickets/events/{eventId}/purchase` · `GET /tickets/my` · `POST /tickets/scan` · `GET /tickets/validate-attendee` · `POST /tickets/{ticketId}/refund` · `GET /tickets/{ticketPublicId}/download` · `GET /tickets/{ticketPublicId}/history`

seating: `GET /seating/event/{eventId}` · `POST /seating/events/{eventId}/layout` · `GET /seating/events/{eventId}/seat-map` · `POST /seating/rows/{rowId}/seats` · `POST /seating/seats/{seatId}/lock` · `POST /seating/seats/{seatId}/release` · `POST /seating/sections` · `POST /seating/sections/{sectionId}/rows`
</details>

<details>
<summary><b>feed (13) · news (8) · offers (8) · polls (6)</b></summary>

feed: `GET /feed/` · `GET /feed/analytics/report` · `POST /feed/polls/{pollId}/vote` · `POST /feed/posts` · `GET /feed/posts/{postId}` · `PATCH /feed/posts/{postId}` · `DELETE /feed/posts/{postId}` · `GET /feed/posts/{postId}/analytics` · `POST /feed/posts/{postId}/bookmark` · `DELETE /feed/posts/{postId}/bookmark` · `POST /feed/posts/{postId}/click` · `POST /feed/posts/{postId}/poll` · `POST /feed/posts/{postId}/share`

news: `POST /news/` · `GET /news/` · `GET /news/bookmarks/my` · `PATCH /news/{newsId}` · `DELETE /news/{newsId}` · `POST /news/{newsId}/bookmark` · `POST /news/{newsId}/restore` · `POST /news/{newsId}/unbookmark`

offers: `GET /offers/` · `POST /offers/` · `GET /offers/browse` · `PATCH /offers/{offerId}` · `GET /offers/{offerId}/analytics` · `POST /offers/{offerId}/save` · `POST /offers/{offerId}/track/{kind}` · `POST /offers/{offerId}/unsave`

polls: `POST /polls/` · `PATCH /polls/{pollId}` · `DELETE /polls/{pollId}` · `POST /polls/{pollId}/close` · `GET /polls/{pollId}/results` · `POST /polls/{pollId}/vote`
</details>

<details>
<summary><b>temples (25) · monks (13) · dharamshalas (28) · jain-centers (17) · chaturmas (6)</b></summary>

temples: `POST /temples/` · `GET /temples/` · `GET /temples/bhojanalay-directory` · `DELETE /temples/reviews/{reviewId}` · `PATCH /temples/reviews/{reviewId}/reply` · `GET /temples/{organizationId}` · `PATCH /temples/{organizationId}` · `POST /temples/{organizationId}/contacts` · `DELETE /temples/{organizationId}/contacts/{contactId}` · `POST /temples/{organizationId}/dhaja` · `DELETE /temples/{organizationId}/dhaja/{dhajaId}` · `PATCH /temples/{organizationId}/dhaja/{dhajaRecordId}` · `POST /temples/{organizationId}/follow` · `POST /temples/{organizationId}/gallery` · `POST /temples/{organizationId}/gallery/bulk` · `DELETE /temples/{organizationId}/gallery/{imageId}` · `POST /temples/{organizationId}/logo` · `POST /temples/{organizationId}/notices` · `DELETE /temples/{organizationId}/notices/{noticeId}` · `POST /temples/{organizationId}/report-incorrect-info` · `POST /temples/{organizationId}/reviews` · `POST /temples/{organizationId}/trustees` · `DELETE /temples/{organizationId}/trustees/{trusteeId}` · `POST /temples/{organizationId}/unfollow` · `POST /temples/{organizationId}/volunteers`

monks: `GET /monks/` · `POST /monks/` · `POST /monks/bulk-import/excel` · `GET /monks/export` · `POST /monks/groups` · `GET /monks/import-template` · `GET /monks/{monkId}` · `PATCH /monks/{monkId}` · `DELETE /monks/{monkId}` · `POST /monks/{monkId}/follow` · `POST /monks/{monkId}/photo` · `PATCH /monks/{monkId}/status` · `POST /monks/{monkId}/unfollow`

dharamshalas: `POST /dharamshalas/` · `GET /dharamshalas/` · `POST /dharamshalas/buildings/{buildingId}/wings` · `DELETE /dharamshalas/reviews/{reviewId}` · `PATCH /dharamshalas/reviews/{reviewId}/reply` · `PATCH /dharamshalas/rooms/{roomId}` · `POST /dharamshalas/wings/{wingId}/rooms` · `GET /dharamshalas/{organizationId}` · `PATCH /dharamshalas/{organizationId}` · `POST /dharamshalas/{organizationId}/buildings` · `POST /dharamshalas/{organizationId}/contacts` · `DELETE …/contacts/{contactId}` · `POST …/dhaja` · `DELETE …/dhaja/{dhajaId}` · `PATCH …/dhaja/{dhajaRecordId}` · `POST …/follow` · `POST …/gallery` · `POST …/gallery/bulk` · `DELETE …/gallery/{imageId}` · `POST …/logo` · `POST …/notices` · `DELETE …/notices/{noticeId}` · `POST …/report-incorrect-info` · `POST …/reviews` · `GET …/structure` · `POST …/trustees` · `DELETE …/trustees/{trusteeId}` · `POST …/unfollow`

jain-centers: `POST /jain-centers/` · `GET /jain-centers/` · `DELETE /jain-centers/reviews/{reviewId}` · `PATCH …/reviews/{reviewId}/reply` · `GET /jain-centers/{organizationId}` · `PATCH …` · `POST …/contacts` · `POST …/dhaja` · `PATCH …/dhaja/{dhajaRecordId}` · `POST …/follow` · `POST …/gallery` · `POST …/notices` · `POST …/report-incorrect-info` · `POST …/reviews` · `POST …/trustees` · `POST …/unfollow` · `POST …/volunteers`

chaturmas: `POST /chaturmas/` · `GET /chaturmas/monk/{monkId}` · `GET /chaturmas/org/{organizationId}` · `GET /chaturmas/{id}` · `PATCH /chaturmas/{id}` · `DELETE /chaturmas/{id}`
</details>

<details>
<summary><b>tours (25) · tracking (11) · manual-tracking (4)</b></summary>

tours: `GET /tours/` · `POST /tours/` · `POST /tours/accommodation/locations/{locationId}/rooms` · `DELETE /tours/participants/{participantId}` · `GET /tours/participants/{participantId}` · `POST …/attendance` · `POST …/jatra-counts` · `PUT …/medical-form` · `POST …/room` · `GET /tours/{tourId}` · `PATCH /tours/{tourId}` · `POST …/accommodation/locations` · `GET …/accommodation/occupancy` · `POST …/communications` · `GET …/communications` · `POST …/daily-jatra/bulk` · `PUT …/daily-schedule` · `GET …/dashboard` · `POST …/participants` · `GET …/participants` · `GET …/participants/{participantId}/certificate` · `POST …/participants/{participantId}/jatra` · `GET …/participants/{participantId}/milestones` · `POST …/sponsors` · `POST …/transition`

tracking: `POST /tracking/journeys` · `GET /tracking/journeys/active` · `POST /tracking/journeys/{journeyId}/events` · `GET /tracking/journeys/{journeyId}/timeline` · `GET /tracking/live-map` · `GET /tracking/monks/{monkId}` · `POST /tracking/monks/{monkId}/sos` · `POST /tracking/pings` · `POST /tracking/routes` · `GET /tracking/routes` · `PATCH /tracking/routes/{routeId}`

manual-tracking: `GET /manual-tracking/` · `POST /manual-tracking/` · `PATCH /manual-tracking/{id}` · `DELETE /manual-tracking/{id}`
</details>

<details>
<summary><b>notifications (5) · devices (4) · communication (5)</b></summary>

notifications: `POST /notifications/broadcast` · `GET /notifications/my` · `GET /notifications/preferences` · `PUT /notifications/preferences` · `POST /notifications/{notificationId}/opened`

devices: `GET /devices/` · `POST /devices/` · `PATCH /devices/{deviceId}/assign` · `POST /devices/{deviceId}/sim-records`

communication: `GET /communication/` · `POST /communication/messages` · `GET /communication/messages` · `DELETE /communication/messages/{messageId}` · `GET /communication/org/{organizationId}`
</details>

<details>
<summary><b>support-tickets (5) · feedback (3) · incorrect-reports (3) · faqs (4)</b></summary>

support-tickets: `POST /support-tickets/` · `GET /support-tickets/` · `GET /support-tickets/my` · `GET /support-tickets/queue` · `PATCH /support-tickets/{ticketId}/status`

feedback: `GET /feedback/` · `POST /feedback/` · `PATCH /feedback/{id}`

incorrect-reports: `GET /incorrect-reports/` · `POST /incorrect-reports/` · `PATCH /incorrect-reports/{id}`

faqs: `POST /faqs/` · `GET /faqs/org/{organizationId}` · `PATCH /faqs/{id}` · `DELETE /faqs/{id}`
</details>

<details>
<summary><b>calendar (8) · counters (11) · community-pages (15) · family (5)</b></summary>

calendar: `POST /calendar/correction-tickets` · `GET /calendar/correction-tickets` · `PATCH /calendar/correction-tickets/{ticketId}` · `GET /calendar/month` · `PATCH /calendar/my-calendar` · `GET /calendar/today` · `GET /calendar/types` · `PUT /calendar/types/{calendarTypeId}/entries`

counters: `GET /counters/admin/overview` · `POST /counters/delta` · `GET /counters/leaderboard` · `GET /counters/my` · `GET /counters/org/{organizationId}` · `POST /counters/reset-all` · `POST /counters/types` · `PATCH /counters/types/{id}` · `DELETE /counters/types/{id}` · `POST /counters/types/{id}/reset` · `POST /counters/{counterId}/reset`

community-pages: `GET /community-pages/` · `POST /community-pages/` · `GET /community-pages/{pageId}` · `PATCH …` · `DELETE …` · `PATCH …/admin` · `GET …/analytics` · `GET …/feed` · `POST …/join` · `POST …/leave` · `GET …/members` · `POST …/members/decision` · `DELETE …/members/{memberId}` · `POST …/posts` · `PATCH …/subscription`

family: `POST /family/` · `GET /family/` · `POST /family/link` · `GET /family/my` · `DELETE /family/{linkId}`
</details>

<details>
<summary><b>volunteers (5) · visitors (10) · gallery (7) · receipts (2) · search (1) · uploads (1)</b></summary>

volunteers: `GET /volunteers/applications/org/{organizationId}` · `PATCH /volunteers/applications/{applicationId}` · `POST /volunteers/opportunities` · `GET /volunteers/opportunities` · `POST /volunteers/opportunities/{opportunityId}/apply`

visitors: `GET /visitors/analytics/{organizationId}` · `POST /visitors/check-in` · `POST /visitors/check-out/{entryId}` · `GET /visitors/live/{organizationId}` · `GET /visitors/member-lookup` · `GET /visitors/my-history` · `POST /visitors/photo` · `GET /visitors/search/{organizationId}` · `GET /visitors/search/{organizationId}/export` · `POST /visitors/sync`

gallery: `POST /gallery/albums` · `GET /gallery/albums/org/{organizationId}` · `PATCH /gallery/albums/{albumId}` · `DELETE /gallery/albums/{albumId}` · `POST /gallery/albums/{albumId}/images` · `DELETE /gallery/images/{imageId}` · `GET /gallery/org/{organizationId}`

receipts: `GET /receipts/` · `GET /receipts/my`

search: `GET /search/`   ·   uploads: `POST /uploads/`
</details>

<details>
<summary><b>Admin / staff / platform-only tags (not used by member app)</b></summary>

`ads` (5) · `alerts` (2) · `announcements` (4) · `audit-logs` (1) · `banners` (4) · `home-sections` (4) · `master-data` (17) · `reports` (6) · `settings` (10) · `staff` (20) · `subscription-plans` (4) — these are management surfaces. `master-data` GETs and `banners`/`home-sections`/`announcements` GETs may also be consumed read-only by the member app for content.
</details>

---

## 13. Quick Reference — Member App Endpoint Shortlist

The minimum set an Android/Web member client needs:

```
AUTH      POST /auth/otp/request · /auth/otp/verify · /auth/login/password ·
          /auth/login/email · /auth/email/otp/request · /auth/email/otp/verify ·
          /auth/google · /auth/refresh · /auth/logout   GET /auth/me
REGISTER  POST /members/register/jain · /members/register/non-jain
PROFILE   GET/PATCH /members/me · POST /members/me/location ·
          PATCH /members/me/community-switch · GET /members/me/qr · POST /members/{id}/photo
HOME      GET /dashboard/member · /dashboard/deep-link/{id}
FEED      GET /feed/ · POST /feed/posts/{id}/bookmark|click|share · /feed/polls/{id}/vote
EVENTS    GET /events/ · /events/member · /events/{id} · POST /events/{id}/rsvp · rsvp/cancel
TICKETS   POST /tickets/events/{id}/purchase · GET /tickets/my · /tickets/{id}/download
BOOKINGS  POST /bookings/ · GET /bookings/my · /bookings/{id} ·
          GET /bookings/items/{id}/availability · POST /bookings/{id}/payment-proof
DONATIONS GET /donations/my · POST /donations/manual · /donations/upload-proof ·
          GET /donations/campaign-config/{flow} · GET /receipts/my
DIRECTORY GET /temples/ · /monks/ · /dharamshalas/ · /jain-centers/  (+ {id}, follow/unfollow)
TOURS     GET /tours/ · /tours/{id} · participant/milestones/certificate
NEWS      GET /news/ · /news/bookmarks/my · POST /news/{id}/bookmark
OFFERS    GET /offers/browse · POST /offers/{id}/save · /offers/{id}/track/{kind}
NOTIFY    GET /notifications/my · POST /notifications/{id}/opened ·
          GET/PUT /notifications/preferences · POST /devices/
SUPPORT   POST /support-tickets/ · GET /support-tickets/my · POST /feedback/ · /incorrect-reports/
SPIRITUAL GET /calendar/today · /calendar/month · /counters/my · POST /counters/delta
FAMILY    GET /family/my · POST /family/ · /family/link
SEARCH    GET /search/?q= · GET /master-data/{listKey}
UPLOAD    POST /uploads/
```

---

*Generated from the live JiNANAM OpenAPI spec (380 routes) + deployed validation
contracts + existing web client. Body schemas beyond the auth layer are gated
behind authentication server-side; field lists here are reconstructed from the
web client's request builders and live 422 validation responses, and should be
confirmed against an authenticated session when wiring each screen.*
