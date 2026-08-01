import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { Search, X, Loader2, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * MemberLinkSelect — Searchable dropdown to link members.
 *
 * Features:
 *   - Search by name AND member ID
 *   - Shows ID before name: "JFJM111 — Saurabh Motta"
 *   - Filter by category: "JAIN" | "NON_JAIN" | "STAFF" | ["JAIN","NON_JAIN"] | null (all members)
 *   - Bug fix (B7): staff records are EXCLUDED by default unless category includes "STAFF"
 *   - showPhone: bool — show mobile number in result list
 *   - multi: bool — allow selecting multiple members
 *
 * Props:
 *   value         — publicId string or array of publicId strings (if multi)
 *   onChange      — (value) => void
 *   category      — "JAIN" | "NON_JAIN" | "STAFF" | string[] | null
 *   showPhone     — boolean (default false)
 *   multi         — boolean (default false)
 *   placeholder   — string
 *   disabled      — boolean
 *   className     — string
 *   id            — string (for label association)
 *   returnValueType — "publicId" | "id"
 */
export default function MemberLinkSelect({
  value,
  onChange,
  category = null,
  showPhone = false,
  multi = false,
  placeholder = "Search member by name or ID…",
  disabled = false,
  className = "",
  id,
  returnValueType = "publicId",
}) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]); // full member objects for display
  const ref = useRef(null);
  const searchTimeout = useRef(null);

  const selectedIds = multi
    ? (Array.isArray(value) ? value : value ? [value] : [])
    : (value ? [value] : []);

  // Build category filter param
  const buildCategoryParam = () => {
    if (!category) return null;
    if (Array.isArray(category)) return category.join(",");
    return category;
  };

  const unwrapList = (res) => {
    const raw = res?.data?.data;
    return Array.isArray(raw) ? raw : (raw?.items || res?.data?.items || []);
  };

  /**
   * Search members to link.
   *
   * Two things previously made this come back empty:
   *   - `page` was omitted (the working members list always sends page + pageSize,
   *     and the API pages from 1), and
   *   - a custom `excludeStaff` flag was sent that the API doesn't implement, so
   *     a filter the server ignored was relied on to shape results.
   *
   * Now it mirrors the known-good list query, filters staff client-side, and
   * falls back to an unfiltered search when a category filter yields nothing —
   * so a narrow or unsupported filter can never look like "search is broken".
   */
  const search = async (q) => {
    setLoading(true);
    try {
      const term = (q || "").trim();
      const cat = buildCategoryParam();
      const base = { page: 1, pageSize: 20 };
      if (term) base.q = term;

      let list = unwrapList(await api.get("/members", { params: cat ? { ...base, category: cat } : base }));

      // A category the backend doesn't honour (or an empty segment) shouldn't
      // read as "no members" — retry once without it.
      if (list.length === 0 && cat) {
        list = unwrapList(await api.get("/members", { params: base }));
      }

      // Staff records are excluded unless explicitly requested (see props).
      const wantsStaff = Array.isArray(category)
        ? category.includes("STAFF")
        : category === "STAFF";
      if (!wantsStaff) {
        list = list.filter((m) => {
          const c = String(m.category || m.memberType || "").toUpperCase();
          return c !== "STAFF" && !m.staffId;
        });
      }

      setResults(list);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFocus = () => {
    setOpen(true);
    // Re-run whenever the box is opened with no results for the current term,
    // rather than caching a stale empty list from an earlier query.
    if (results.length === 0) search(query);
  };

  const handleQueryChange = (e) => {
    const q = e.target.value;
    setQuery(q);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => search(q), 300);
  };

  const selectMember = (member) => {
    const valToReturn = returnValueType === "id" ? member.id : member.publicId;
    if (multi) {
      const newIds = selectedIds.includes(valToReturn)
        ? selectedIds.filter((val) => val !== valToReturn)
        : [...selectedIds, valToReturn];
      onChange?.(newIds);
      // Update local display objects
      setSelectedMembers((prev) => {
        if (prev.find((m) => m[returnValueType] === valToReturn)) {
          return prev.filter((m) => m[returnValueType] !== valToReturn);
        }
        return [...prev, member];
      });
    } else {
      onChange?.(valToReturn);
      setSelectedMembers([member]);
      setOpen(false);
      setQuery("");
      setResults([]);
    }
  };

  const removeMember = (valToRemove) => {
    if (multi) {
      onChange?.(selectedIds.filter((id) => id !== valToRemove));
      setSelectedMembers((prev) => prev.filter((m) => m[returnValueType] !== valToRemove));
    } else {
      onChange?.(null);
      setSelectedMembers([]);
    }
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch display info for pre-set IDs on mount
  useEffect(() => {
    if (selectedIds.length === 0) { setSelectedMembers([]); return; }
    // Only fetch if we don't already have them
    const missing = selectedIds.filter(
      (id) => !selectedMembers.find((m) => m[returnValueType] === id)
    );
    if (missing.length === 0) return;
    Promise.all(
      missing.map((id) =>
        api.get(`/members/${id}`).then((r) => r.data?.data).catch(() => null)
      )
    ).then((fetched) => {
      setSelectedMembers((prev) => [
        ...prev,
        ...fetched.filter(Boolean),
      ]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const formatMemberLabel = (m) =>
    `${m.publicId} — ${m.fullName || [m.firstName, m.surname].filter(Boolean).join(" ")}`;

  return (
    <div ref={ref} className={cn("relative", className)}>
      {/* Selected tags (multi) or single display */}
      {multi && selectedMembers.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-1.5">
          {selectedMembers.map((m) => (
            <span
              key={m.publicId}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 border border-orange-200 text-xs font-medium text-orange-800"
            >
              <span className="font-mono text-[10px] text-orange-600">{m.publicId}</span>
              <span>{m.fullName || [m.firstName, m.surname].filter(Boolean).join(" ")}</span>
              <button
                type="button"
                onClick={() => removeMember(returnValueType === "id" ? m.id : m.publicId)}
                className="ml-0.5 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Trigger / Input */}
      {!multi && selectedMembers.length > 0 ? (
        <div className="flex items-center gap-2 h-9 px-3 rounded-md border border-input bg-background text-sm">
          <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="flex-1 text-left truncate">
            {formatMemberLabel(selectedMembers[0])}
            {showPhone && selectedMembers[0]?.mobile && (
              <span className="text-muted-foreground ml-1.5">· {selectedMembers[0].mobile}</span>
            )}
          </span>
          {!disabled && (
            <button type="button" onClick={() => removeMember(returnValueType === "id" ? selectedMembers[0]?.id : selectedMembers[0]?.publicId)}>
              <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
      ) : (
        <div
          className={cn(
            "flex items-center gap-2 h-9 px-3 rounded-md border border-input bg-background text-sm cursor-text",
            "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1",
            disabled && "opacity-50 pointer-events-none"
          )}
          onClick={() => !disabled && setOpen(true)}
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 text-muted-foreground shrink-0 animate-spin" />
          ) : (
            <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          )}
          <input
            id={id}
            type="text"
            value={query}
            onChange={handleQueryChange}
            onFocus={handleFocus}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground text-sm"
            data-testid="member-link-search"
          />
        </div>
      )}

      {/* Dropdown results */}
      {open && (
        <div
          className="absolute z-50 mt-1 w-full bg-popover border border-border rounded-xl shadow-xl overflow-hidden"
          data-testid="member-link-results"
        >
          {/* Search (shown when single + already selected) */}
          {!multi && selectedMembers.length > 0 && (
            <div className="p-2 border-b border-border">
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-muted text-sm">
                <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={handleQueryChange}
                  placeholder={t("Search to change…")}
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                  autoFocus
                />
              </div>
            </div>
          )}

          <div className="max-h-64 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-6 text-muted-foreground text-sm gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("Searching…")}
              </div>
            )}
            {!loading && query.length >= 2 && results.length === 0 && (
              <div className="py-6 text-center text-muted-foreground text-sm">
                {t("No members found for \"")}{query}"
              </div>
            )}
            {!loading && query.length < 2 && results.length === 0 && (
              <div className="py-4 text-center text-muted-foreground text-xs">
                {t("Type at least 2 characters to search")}
              </div>
            )}
            {results.map((m) => {
              const isSelected = selectedIds.includes(m.publicId);
              return (
                <button
                  key={m.publicId}
                  type="button"
                  onClick={() => selectMember(m)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent transition-colors text-left",
                    isSelected && "bg-orange-50 border-l-2 border-orange-500"
                  )}
                  data-testid={`member-option-${m.publicId}`}
                >
                  {/* Avatar placeholder */}
                  <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                    {m.photoUrl ? (
                      <img src={m.photoUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-slate-500">
                        {(m.fullName || m.firstName || "?")[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] font-bold text-orange-600">{m.publicId}</span>
                      <span className="text-sm font-medium truncate">
                        {m.fullName || [m.firstName, m.surname].filter(Boolean).join(" ")}
                      </span>
                    </div>
                    {showPhone && m.mobile && (
                      <div className="text-xs text-muted-foreground">{m.mobile}</div>
                    )}
                    {m.category && (
                      <div className="text-[10px] text-muted-foreground capitalize">
                        {m.category.replace("_", "-")}
                        {m.currentAddress?.city ? ` · ${m.currentAddress.city}` : ""}
                      </div>
                    )}
                  </div>
                  {isSelected && (
                    <span className="text-orange-500 text-xs font-bold shrink-0">✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
