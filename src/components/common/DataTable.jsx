import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "./EmptyState";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * A dense, sticky-header data table with i18n column header translation.
 * columns: [{ key, header, render?, className?, width? }]
 * rows: array
 * onRowClick: optional
 */
export function DataTable({
  columns,
  rows,
  loading,
  emptyTitle,
  emptyDescription,
  onRowClick,
  rowKey = "id",
  testId = "data-table",
  className,
}) {
  const { t } = useLanguage();

  const colTranslationMap = {
    "Name": "col.name",
    "Mobile": "col.mobile",
    "Mobile Number": "col.mobile",
    "Location": "col.city",
    "City": "col.city",
    "Status": "col.status",
    "Employment": "col.status",
    "Actions": "col.actions",
    "Quick Actions": "col.actions",
    "Joining Date": "col.joiningDate",
    "Category": "col.category",
    "Reporting To": "col.reportingTo",
    "Public ID": "col.publicId",
    "Staff ID": "col.publicId",
    "System Role": "col.role",
  };

  return (
    <div className={cn("rounded-md border border-border bg-white overflow-hidden", className)} data-testid={testId}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-secondary/60">
            <TableRow className="hover:bg-transparent">
              {columns.map((c) => {
                // Curated dotted key first, then the English header as the key.
                let headerText = c.header;
                if (typeof c.header === "string") {
                  const dotted = colTranslationMap[c.header];
                  const mapped = dotted ? t(dotted, "") : "";
                  headerText = mapped && mapped !== dotted ? mapped : t(c.header);
                }
                return (
                  <TableHead
                    key={c.key}
                    className={cn(
                      "text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground h-10 px-4",
                      c.className
                    )}
                    style={c.width ? { width: c.width } : undefined}
                  >
                    {headerText}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  {columns.map((c) => (
                    <TableCell key={c.key} className="px-4 py-3">
                      <Skeleton className="h-4 w-3/4" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            {!loading && rows?.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} className="p-0">
                  <EmptyState
                    title={emptyTitle || "No records yet"}
                    description={emptyDescription || "Once data is available, it will appear here."}
                    className="border-0 rounded-none"
                  />
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              rows?.map((row, idx) => {
                const key = row[rowKey] || row.publicId || row.id || idx;
                return (
                  <TableRow
                    key={key}
                    className={cn(
                      "border-b border-border last:border-0",
                      onRowClick && "cursor-pointer hover:bg-accent/50"
                    )}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    data-testid={`${testId}-row-${idx}`}
                  >
                    {columns.map((c) => (
                      <TableCell
                        key={c.key}
                        className={cn("px-4 py-3 text-sm", c.cellClassName)}
                      >
                        {c.render ? c.render(row) : row[c.key] ?? "—"}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default DataTable;
