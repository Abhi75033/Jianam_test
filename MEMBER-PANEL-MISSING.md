# Member Panel — What's Missing

Analysis of the Member Panel against the full specification (Visibility Engine, Member
Registration, Feed, Events, Tours, Offers, News, Community Pages, 99 Management,
Visitor, Booking) and the 5-tab navigation structure.

Admin and Super Admin features are excluded — member-facing only.

---

## 1. Your two headline problems, measured

### "Most of the tabs are having same page" — confirmed

**24 sidebar tabs resolve to only 16 distinct screens.** Eight tabs are query strings or
hash fragments pointing at a page that is already another tab:

| Page | Tabs pointing at it |
|---|---|
| `/member/explore` | Universal Directory, Jain Centres, Dharamshalas, Bhojanshalas *(4)* |
| `/member/feed` | Community Feed, MS Updates, Events & Notices, Sponsored Posts *(4)* |
| `/member/offers` | Featured Offers, Categories Grid, Coupons & Deals *(3)* |

Those tabs pass `?filter=` / `?cat=` / `#anchor`, but **the pages never read them** — so
all four Feed tabs render the identical unfiltered list, and all four Explore tabs render
the same directory. The tab looks distinct and behaves identically.

### "I want Real time application" — nothing is real-time

| | Socket usage |
|---|---|
| Admin panel | **6 files** (`useSocket`) |
| Member panel | **0 files** |

Every member screen is a one-shot fetch on mount. No live feed, no live MS tracking, no
live booking status, no live notification badge. The `useSocket` hook already exists and
works — it has simply never been used on the member side.

---

## 2. Navigation structure is wrong

The spec defines **5 bottom-nav tabs** — Home · Feed · Offers · Explore · Profile — with
Notification Bell, Search and Messages in a top app bar.

What exists is a **desktop sidebar with 25 links** and no bottom nav at all
(`MobileBottomNav` exists for admin only). For a "mobile-first" platform this is the
single biggest structural gap: the whole information architecture differs from spec.

---

## 3. Entire screens that do not exist

| # | Screen | Spec | Endpoint ready? |
|---|---|---|---|
| 1 | **Temple / Jain Centre detail** | §4.5.3 — Dhaja, bank/UPI, gallery, events, tours, timings, trustees | ✅ `/temples/{id}` |
| 2 | **Dharamshala detail + booking flow** | Accommodation — room/dorm/hall selection, availability, 10-step booking | ✅ `/dharamshalas`, `/bookings/` |
| 3 | **Polls** | §4.11.4 — vote once, no change after submit, view results | ✅ `/polls/{id}/vote` |
| 4 | **Volunteers** | §4.10 — browse opportunities, apply, Applied/Approved/Rejected | ✅ `/volunteers/opportunities` |
| 5 | **Gallery** | §4.13 — albums, images, video links, view-only | ✅ `/temples/{id}/gallery` |
| 6 | **Announcements** | §4.14 — full view from linked temples | ✅ `/announcements/` |
| 7 | **Community Pages** | Join, member list, page feed, events, polls | ✅ `/community-pages` |
| 8 | **99 Management (member view)** | Daily jatra progress, room allocation, roommates, schedule, certificate | ⚠️ needs check |
| 9 | **Varshitap** | Progress tracking | ⚠️ needs check |
| 10 | **Spiritual Counting** | Daily counter, goal, streak | ✅ `/counters/my` |
| 11 | **My Temple Visits** | Visitor §8 — check-in/out history, duration, vehicle | ⚠️ needs check |
| 12 | **Tour registration** | Register, participants, itinerary, status | ✅ `/tours/` |
| 13 | **Event detail + RSVP** | §4.7.4 — filters, capacity, waitlist, share | ✅ `/events/member` |
| 14 | **Messages** | Top app bar | ✅ `/communication/messages` |
| 15 | **Settings** | Language, currency, notification prefs, privacy, security, theme | ⚠️ partial |

**Fifteen screens.** Most already have a live endpoint — this is frontend work, not
backend work.

---

## 4. The Follow System — biggest functional gap

The spec's **entire content-priority model** rests on following. It does not exist
anywhere in the member panel.

Members must be able to follow: **Temple · Dharamshala · Sthanak · Jain Centre · Monk ·
Community Page**. Everything a followed entity publishes — events, announcements,
notices, polls, feed posts, news, updates, volunteer requests, tours — must appear
**first**, regardless of location.

Required priority order, applied to Home Feed, Events, Notifications, Announcements,
Polls and News:

```
1. Followed entities            ← highest, ignores location
2. Same community + current area
3. Same community + nearby
4. Same community + state
5. Same community + country
6. Other communities            ← search only, never in feed
```

**Status:** no follow button, no follow state, no priority sorting, no community filter,
no location tier. Feed is a flat unsorted list.

The API has `POST /monks/{id}/follow` and `/temples/{id}/follow`, but only flat
follow/unfollow — **no primary/secondary tiering** (spec requires 1+2+6 temples, 1+9
monks) and no default Jain Music Fest link. That part needs backend work.

---

## 5. Location engine — completely absent

**Zero geolocation calls in the member panel.**

The spec requires location to drive priority everywhere:

- Current GPS if available, else registered address
- Travel detection — arriving in Palitana makes Palitana content top priority
- Feed radius expansion on scroll: area → 5 km → 10 km → 20 km → city → district → state → country → global
- "Offers Near You", "Nearby Temples", distance on every card
- Explore map view

None of it exists. `POST /members/me/location` is available and unused.

---

## 6. Missing within screens that do exist

**Home** — spec lists 15 sections; missing: Nearby Temples (GPS), Offers Near You (GPS),
Upcoming Bookings, Daily Spiritual Card, Suggested Communities, Suggested Temples,
footer ad.

**Feed** — missing: Stories row (Temple/MS/Community), like, comment, report, follow
buttons, polls inline, sponsored post after every 7 items, working filters.

**Offers** — missing: nearby/GPS, coupons & QR codes, sponsored businesses, save/bookmark,
working category grid.

**Explore** — missing: map view, Discover (trending/popular/newest/most-visited),
advanced filters (community, sub-community, gaccha, distance, facilities), universal
search across all 10 entity types.

**Profile** — missing: My Activity (polls, reviews, comments, feed activity), My Spiritual
Journey (99 Yatra, Varshitap, counting, badges, achievements), My Communities (joined
pages, following temples, following MS, saved places, favourite offers), privacy controls
(show/hide mobile, show/hide address, allow contact), currency preference, About/Help.

**Registration** — missing from §1–§21: profile photo upload, PAN/Aadhaar, marital status,
alternate contact, permanent + native addresses, temple preferences (max 5 + 10),
health/emergency block, professional details, volunteering block, privacy controls,
profile-completion %, badges (Senior Citizen/Volunteer/Verified).

---

## 7. Recommended order

| Phase | Work | Why first |
|---|---|---|
| **A** | Make the 8 duplicate tabs read their `?filter` / `?cat` / `#anchor` params | Smallest change, removes the most visible problem |
| **B** | 5-tab bottom nav + top app bar | Aligns IA with spec before more screens are added |
| **C** | Follow system + priority sort | Everything else in the spec depends on it |
| **D** | Location engine — GPS, distance, radius tiers | Second half of the priority model |
| **E** | The 15 missing screens | Most have live endpoints already |
| **F** | Real-time via `useSocket` — feed, MS tracking, bookings, notification badge | Hook already exists and works in admin |

Phase A is roughly one session and fixes the complaint you raised. Phase C is the one
that needs a backend change first (tiered linking).
