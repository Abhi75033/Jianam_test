import { useEffect, useMemo, useRef, useState } from "react";
import { Instagram, Facebook, Youtube, Send, Check, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

/* ── Configuration ────────────────────────────────────────────────
   LAUNCH_DATE is a fixed moment, not a rolling offset — the number
   must keep counting down for every visitor. Currently set to seven
   days out; change it to the real public-launch moment.             */
const LAUNCH_DATE = new Date("2026-08-05T09:00:00+05:30");

const CONTACT_EMAIL = "contact@jinanam.org";

/* Same Jain temple photograph the admin login hero uses. */
const TEMPLE_IMAGE =
  "https://images.unsplash.com/photo-1524443169398-9aa1ceab67d5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjV8MHwxfHNlYXJjaHwxfHxqYWluJTIwdGVtcGxlJTIwYXJjaGl0ZWN0dXJlJTIwcGVhY2VmdWx8ZW58MHx8fHwxNzgzMzM1OTQ4fDA&ixlib=rb-4.1.0&q=85";

/* Social links — replace "#" with the real handles when they exist. */
const SOCIALS = [
  { icon: Instagram, label: "Instagram", href: "#" },
  { icon: Send, label: "Telegram", href: "#" },
  { icon: Facebook, label: "Facebook", href: "#" },
  { icon: Youtube, label: "YouTube", href: "#" },
];

function getRemaining(target) {
  const ms = target.getTime() - Date.now();
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, done: true };
  return {
    days: Math.floor(ms / 86400000),
    hours: Math.floor((ms / 3600000) % 24),
    minutes: Math.floor((ms / 60000) % 60),
    done: false,
  };
}

/* Deterministic pseudo-random so the starfield doesn't reshuffle on
   every render — seeded by index, no dependency on Math.random().   */
function makeStars(count) {
  const stars = [];
  for (let i = 0; i < count; i++) {
    const a = Math.sin(i * 12.9898) * 43758.5453;
    const b = Math.sin(i * 78.233) * 12345.6789;
    const c = Math.sin(i * 3.14159) * 9876.54321;
    stars.push({
      top: `${Math.abs(a - Math.floor(a)) * 100}%`,
      left: `${Math.abs(b - Math.floor(b)) * 100}%`,
      size: Math.abs(c - Math.floor(c)) * 1.8 + 0.6,
      delay: `${(Math.abs(a - Math.floor(a)) * 6).toFixed(2)}s`,
      opacity: Math.abs(c - Math.floor(c)) * 0.5 + 0.25,
    });
  }
  return stars;
}

export default function SiteComingSoonPage() {
  const { t } = useLanguage();
  const [remaining, setRemaining] = useState(() => getRemaining(LAUNCH_DATE));
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | error | done
  const stars = useMemo(() => makeStars(70), []);
  const rootRef = useRef(null);

  useEffect(() => {
    const id = setInterval(() => setRemaining(getRemaining(LAUNCH_DATE)), 1000);
    return () => clearInterval(id);
  }, []);

  /* Pointer parallax. Writes two unitless CSS variables on the root and
     lets each layer multiply them by its own depth — so the browser
     composites the whole scene without React re-rendering per frame. */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const fine = window.matchMedia("(pointer: fine)").matches;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || still) return;

    let frame = 0;
    let tx = 0;
    let ty = 0;

    const apply = () => {
      frame = 0;
      root.style.setProperty("--mx", tx.toFixed(4));
      root.style.setProperty("--my", ty.toFixed(4));
    };

    const onMove = (e) => {
      // normalise to -1 … 1 around the viewport centre
      tx = (e.clientX / window.innerWidth) * 2 - 1;
      ty = (e.clientY / window.innerHeight) * 2 - 1;
      if (!frame) frame = requestAnimationFrame(apply);
    };

    const onLeave = () => {
      tx = 0;
      ty = 0;
      if (!frame) frame = requestAnimationFrame(apply);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStatus("error");
      return;
    }
    /* TODO: POST to a real subscriber endpoint once the backend
       exposes one. Nothing is persisted today — this only confirms
       to the visitor that the address was accepted.                 */
    setStatus("done");
  };

  const cells = [
    { value: remaining.days, label: t("Days") },
    { value: remaining.hours, label: t("Hours") },
    { value: remaining.minutes, label: t("Minutes") },
  ];

  return (
    <div
      ref={rootRef}
      className="jn-root relative min-h-screen overflow-hidden bg-[#0a0812] font-body text-white"
      style={{ "--mx": 0, "--my": 0 }}
    >
      <style>{`
        .jn-root { perspective: 1000px; perspective-origin: 50% 45%; }

        @keyframes jn-drift {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50%      { transform: translate3d(var(--dx, 20px), var(--dy, -24px), 0); }
        }
        @keyframes jn-twinkle {
          0%, 100% { opacity: var(--o, 0.4); }
          50%      { opacity: 0.05; }
        }
        @keyframes jn-rise {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        /* slow push-in on the temple so the scene never sits perfectly still */
        @keyframes jn-breathe {
          0%, 100% { transform: scale(1.14); }
          50%      { transform: scale(1.2); }
        }

        .jn-orb    { animation: jn-drift 22s ease-in-out infinite; }
        .jn-star   { animation: jn-twinkle 5s ease-in-out infinite; }
        .jn-rise   { animation: jn-rise .7s cubic-bezier(.16,1,.3,1) both; }

        /* ── Parallax depth ──────────────────────────────────────
           Each layer multiplies the shared pointer vector by its own
           amplitude. Small = distant, large = close to the viewer.  */
        .jn-par { will-change: transform; transition: transform .45s cubic-bezier(.22,1,.36,1); }
        .jn-d-stars  { transform: translate3d(calc(var(--mx) * 5px),  calc(var(--my) * 4px),  0); }
        .jn-d-far    { transform: translate3d(calc(var(--mx) * -13px), calc(var(--my) * -9px), 0) scale(1.14); }
        .jn-d-orb    { transform: translate3d(calc(var(--mx) * 24px), calc(var(--my) * 18px), 0); }
        .jn-d-near   { transform: translate3d(calc(var(--mx) * -42px), calc(var(--my) * -16px), 0) scale(1.22); }
        .jn-d-content{
          transform: translate3d(calc(var(--mx) * 9px), calc(var(--my) * 6px), 0)
                     rotateY(calc(var(--mx) * -1.6deg)) rotateX(calc(var(--my) * 1.1deg));
          transform-style: preserve-3d;
        }

        /* the temple layer breathes inside its parallax wrapper */
        .jn-breathe { animation: jn-breathe 26s ease-in-out infinite; }

        /* translateZ only renders if every ancestor up to the
           perspective root keeps its 3D context */
        .jn-rise, .jn-cellwrap { transform-style: preserve-3d; }

        /* countdown cells sit forward in Z and lift toward the cursor */
        .jn-cell {
          transform: translateZ(28px);
          transition: transform .35s cubic-bezier(.22,1,.36,1), border-color .35s, background-color .35s;
        }
        .jn-cell:hover { transform: translateZ(52px) translateY(-4px); }

        @media (prefers-reduced-motion: reduce) {
          .jn-orb, .jn-star, .jn-rise, .jn-breathe { animation: none !important; }
          .jn-par, .jn-d-content, .jn-cell { transform: none !important; transition: none !important; }
          .jn-d-far { transform: scale(1.05) !important; }
        }
      `}</style>

      {/* ── Background ─────────────────────────────────────────── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {/* FAR — the temple itself, drifting least */}
        <div className="jn-par jn-d-far absolute inset-0">
          <img
            src={TEMPLE_IMAGE}
            alt=""
            className="jn-breathe absolute inset-0 h-full w-full object-cover object-center opacity-[.34]"
          />
        </div>
        {/* the login hero's maroon → saffron wash, over a darkening base */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(114,47,55,.62) 0%, rgba(211,84,0,.52) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(10,8,18,.78) 0%, rgba(10,8,18,.55) 45%, rgba(10,8,18,.92) 100%)",
          }}
        />

        {/* warm saffron wash */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(1200px 700px at 75% 15%, rgba(203,81,17,.28), transparent 60%)," +
              "radial-gradient(900px 600px at 15% 85%, rgba(117,48,60,.32), transparent 65%)," +
              "radial-gradient(700px 500px at 50% 50%, rgba(224,169,58,.10), transparent 70%)",
          }}
        />

        <div className="jn-par jn-d-stars absolute inset-0">
          {stars.map((s, i) => (
            <span
              key={i}
              className="jn-star absolute rounded-full bg-white"
              style={{
                top: s.top,
                left: s.left,
                width: s.size,
                height: s.size,
                "--o": s.opacity,
                animationDelay: s.delay,
              }}
            />
          ))}
        </div>

        {/* MID — glowing orbs, in brand tones */}
        <div className="jn-par jn-d-orb absolute inset-0">
        <div
          className="jn-orb absolute -right-24 -top-28 h-80 w-80 rounded-full blur-2xl md:h-[26rem] md:w-[26rem]"
          style={{
            "--dx": "-26px",
            "--dy": "22px",
            background:
              "radial-gradient(circle at 32% 30%, #E0A93A 0%, #C2570F 42%, #6d2a12 72%, transparent 78%)",
            opacity: 0.4,
          }}
        />
        <div
          className="jn-orb absolute -bottom-40 -left-32 h-[30rem] w-[30rem] rounded-full blur-2xl"
          style={{
            "--dx": "28px",
            "--dy": "-18px",
            animationDelay: "-7s",
            background:
              "radial-gradient(circle at 62% 38%, #9c3f4f 0%, #75303C 45%, #3a1622 72%, transparent 78%)",
            opacity: 0.45,
          }}
        />
        <div
          className="jn-orb absolute -left-16 top-24 hidden h-52 w-52 rounded-full blur-2xl lg:block"
          style={{
            "--dx": "18px",
            "--dy": "26px",
            animationDelay: "-13s",
            background:
              "radial-gradient(circle at 40% 34%, #d9b063 0%, #8a6a24 48%, transparent 74%)",
            opacity: 0.3,
          }}
        />
        </div>

        {/* NEAR — the same temple again as a darkened foreground mass,
            anchored to the bottom and moving ~3× the far layer. The
            offset between the two is what reads as depth. */}
        <div className="jn-par jn-d-near absolute inset-x-0 bottom-0 h-[62%]">
          <img
            src={TEMPLE_IMAGE}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-bottom"
            style={{
              filter: "brightness(.2) saturate(1.15) blur(1.6px)",
              opacity: 0.68,
              maskImage:
                "linear-gradient(180deg, transparent 0%, rgba(0,0,0,.45) 34%, #000 72%)",
              WebkitMaskImage:
                "linear-gradient(180deg, transparent 0%, rgba(0,0,0,.45) 34%, #000 72%)",
            }}
          />
        </div>

        {/* vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 40%, transparent 45%, rgba(5,4,10,.85) 100%)",
          }}
        />
      </div>

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="relative z-10 flex items-center justify-between px-5 py-5 sm:px-10 sm:py-7">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt=""
            className="h-10 w-10 rounded-xl object-contain sm:h-11 sm:w-11"
          />
          <div className="flex items-center gap-2.5">
            <span className="font-brand text-2xl leading-none tracking-wide sm:text-[1.7rem]">
              {t("JiNANAM")}
            </span>
            <span className="rounded-full border border-white/25 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[.14em] text-white/70">
              {t("Beta")}
            </span>
          </div>
        </div>

        {/* Admin entry point — full page load, the admin app is a
            separate router tree mounted at /admin. */}
        <a
          href="/admin"
          className="group inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-md transition hover:border-white/40 hover:bg-white/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E0A93A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0812] sm:px-5"
        >
          <ShieldCheck className="h-4 w-4 opacity-80 transition group-hover:opacity-100" />
          {t("Admin")}
        </a>
      </header>

      {/* ── Main ───────────────────────────────────────────────── */}
      <main className="jn-par jn-d-content relative z-10 mx-auto flex min-h-[calc(100vh_-_8.5rem)] max-w-4xl flex-col items-center justify-center px-5 pb-16 text-center">
        <div
          className="jn-rise mb-5 text-[11px] uppercase tracking-[.28em] text-white/75"
          style={{ animationDelay: ".02s" }}
        >
          {t("Serving the Jain community")}
        </div>

        <h1
          className="jn-rise font-brand text-[3.25rem] font-semibold leading-[1.05] tracking-tight sm:text-7xl lg:text-8xl"
          style={{ animationDelay: ".05s" }}
        >
          {t("Coming Soon")}
        </h1>

        <p
          className="jn-rise mt-5 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg"
          style={{ animationDelay: ".15s" }}
        >
          {t("One platform for every temple, MS & seva — bookings, donations, events and community, beautifully organised.")}
        </p>

        {/* Countdown */}
        <div
          className="jn-rise mt-11 flex items-center gap-2.5 sm:gap-4"
          style={{ animationDelay: ".25s" }}
          role="timer"
          aria-live="off"
          aria-label={`${remaining.days} days, ${remaining.hours} hours and ${remaining.minutes} minutes until launch`}
        >
          {cells.map((c, i) => (
            <div key={c.label} className="jn-cellwrap flex items-center gap-2.5 sm:gap-4">
              <div className="jn-cell min-w-[6.1rem] rounded-2xl border border-white/15 bg-white/[.07] px-4 py-4 shadow-[0_18px_40px_-18px_rgba(0,0,0,.85)] backdrop-blur-md hover:border-white/30 hover:bg-white/[.11] sm:min-w-[9rem] sm:px-7 sm:py-5">
                <div className="flex items-baseline justify-center gap-1.5">
                  <span className="font-heading text-2xl font-bold tabular-nums sm:text-4xl">
                    {String(c.value).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] uppercase tracking-[.16em] text-white/55 sm:text-xs">
                    {t(c.label)}
                  </span>
                </div>
              </div>
              {i < cells.length - 1 && (
                <span className="text-xl text-white/30 sm:text-2xl">:</span>
              )}
            </div>
          ))}
        </div>

        {/* Subscribe */}
        <div className="jn-rise mt-12 w-full max-w-md" style={{ animationDelay: ".35s" }}>
          <label
            htmlFor="notify-email"
            className="block text-sm text-white/65 sm:text-base"
          >
            {t("Get notified when we go live:")}
          </label>

          <form
            onSubmit={handleSubscribe}
            className="mt-3.5 flex flex-col gap-3 sm:flex-row"
            noValidate
          >
            <input
              id="notify-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              disabled={status === "done"}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === "error") setStatus("idle");
              }}
              aria-invalid={status === "error"}
              aria-describedby={status === "error" ? "notify-error" : undefined}
              className={`flex-1 rounded-xl border bg-white/[.06] px-4 py-3 text-sm text-white placeholder:text-white/35 backdrop-blur-md transition focus:outline-none focus:ring-2 focus:ring-[#E0A93A]/70 disabled:opacity-60 ${
                status === "error" ? "border-red-400/70" : "border-white/15"
              }`}
            />
            <button
              type="submit"
              disabled={status === "done"}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C2570F] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#C2570F]/25 transition hover:bg-[#d4610f] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E0A93A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0812] disabled:cursor-default disabled:bg-white/15 disabled:shadow-none"
            >
              {status === "done" ? (
                <>
                  {t("Subscribed")} <Check className="h-4 w-4" />
                </>
              ) : (
                t("Subscribe")
              )}
            </button>
          </form>

          <p className="mt-2.5 min-h-[1.25rem] text-xs" aria-live="polite">
            {status === "error" && (
              <span id="notify-error" className="text-red-300">
                {t("Please enter a valid email address.")}
              </span>
            )}
            {status === "done" && (
              <span className="text-[#E0A93A]">
                {t("Thank you — we'll be in touch when JiNANAM launches.")}
              </span>
            )}
          </p>
        </div>

        {/* Contact */}
        <div className="jn-rise mt-9" style={{ animationDelay: ".45s" }}>
          <p className="text-sm text-white/55">
            {t("If you have any questions, please contact us at:")}
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="mt-1.5 inline-block text-base font-medium text-[#E0A93A] underline-offset-4 transition hover:text-[#f0bf5c] hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
        </div>

        {/* Socials */}
        <div
          className="jn-rise mt-8 flex items-center gap-3"
          style={{ animationDelay: ".55s" }}
        >
          {SOCIALS.map(({ icon: Icon, label, href }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              className="rounded-full border border-white/10 p-2.5 text-white/50 transition hover:border-white/30 hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E0A93A]"
            >
              <Icon className="h-[18px] w-[18px]" />
            </a>
          ))}
        </div>
      </main>

      <footer className="relative z-10 pb-8 text-center text-xs text-white/40">
        © {new Date().getFullYear()} {t("JiNANAM Foundation. All rights reserved.")}
      </footer>
    </div>
  );
}
