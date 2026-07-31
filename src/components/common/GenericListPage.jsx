import { useEffect, useState } from "react";
import { api, extractErrorMessage } from "@/lib/api";
import { PageHeader } from "./PageHeader";
import { DataTable } from "./DataTable";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * A reusable module-level list page powered by a single GET endpoint.
 * Renders a header, search box, and a data table.
 * Used for many modules where we just need a browsable list.
 */
export default function GenericListPage({
  title,
  subtitle,
  endpoint,
  columns,
  extraActions,
  emptyTitle,
  emptyDescription,
  testId,
  searchable = true,
  transformResponse,
}) {
  const { t } = useLanguage();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    api
      .get(endpoint)
      .then((res) => {
        if (!mounted) return;
        const data = res.data?.data;
        const list = transformResponse
          ? transformResponse(data)
          : Array.isArray(data)
          ? data
          : data?.items || [];
        setRows(list || []);
      })
      .catch((err) => {
        if (!mounted) return;
        const msg = extractErrorMessage(err);
        setError(msg);
        setRows([]);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const filtered = q
    ? rows.filter((r) =>
        JSON.stringify(r).toLowerCase().includes(q.toLowerCase())
      )
    : rows;

  return (
    <div data-testid={testId}>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={extraActions}
      />
      {searchable && (
        <div className="mb-4 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("action.search", "Search...")}
              className="pl-9 bg-white"
              data-testid={`${testId}-filter-input`}
            />
          </div>
        </div>
      )}
      <DataTable
        columns={columns}
        rows={filtered}
        loading={loading}
        emptyTitle={error ? t("Unable to load data") : emptyTitle}
        emptyDescription={
          error ? error : emptyDescription || "Data will appear here once available."
        }
        testId={`${testId}-table`}
      />
    </div>
  );
}
