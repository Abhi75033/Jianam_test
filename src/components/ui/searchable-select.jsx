/**
 * SearchableSelect — Popover + Command combobox
 * ─────────────────────────────────────────────────────────────────────────────
 * Drop-in replacement for both:
 *   • Native HTML <select>
 *   • Radix UI <Select> (from @radix-ui/react-select)
 *
 * Props:
 *   value          — currently selected value (string)
 *   onValueChange  — callback(newValue: string)
 *   options        — [{ value: string, label: string }]
 *   placeholder    — text when nothing is selected (default: "Select…")
 *   searchPlaceholder — input hint (default: "Search…")
 *   emptyText      — text when search has no results (default: "No results found.")
 *   disabled       — boolean
 *   className      — extra classes for the trigger button
 *   align          — popover alignment: "start" | "center" | "end" (default: "start")
 * ─────────────────────────────────────────────────────────────────────────────
 */

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

/**
 * SearchableSelect
 */
const SearchableSelect = React.forwardRef(function SearchableSelect(
  {
    value = "",
    onValueChange,
    options = [],
    placeholder = "Select…",
    searchPlaceholder = "Search…",
    emptyText = "No results found.",
    disabled = false,
    className,
    align = "start",
    ...props
  },
  ref
) {
  const [open, setOpen] = React.useState(false);

  // Find the label for the current value
  const selectedLabel = React.useMemo(() => {
    if (!value) return null;
    const found = options.find((o) => String(o.value) === String(value));
    return found ? found.label : value;
  }, [value, options]);

  function handleSelect(optValue) {
    // Toggle off if same value selected again (optional: remove this for strict mode)
    const next = String(optValue) === String(value) ? "" : optValue;
    onValueChange?.(next);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <Button
          ref={ref}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "h-9 w-full justify-between rounded-md border border-slate-200 bg-white px-3 text-sm font-normal shadow-none hover:bg-white focus:ring-1 focus:ring-orange-400",
            !selectedLabel && "text-muted-foreground",
            className
          )}
          {...props}
        >
          <span className="truncate">{selectedLabel || placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-40" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] min-w-[180px] max-w-sm p-0"
        align={align}
        sideOffset={4}
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} className="h-9" />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem
                  key={opt.value}
                  value={opt.label} /* cmdk matches on this string */
                  onSelect={() => handleSelect(opt.value)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      String(value) === String(opt.value)
                        ? "opacity-100 text-orange-500"
                        : "opacity-0"
                    )}
                  />
                  {opt.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
});

SearchableSelect.displayName = "SearchableSelect";

export { SearchableSelect };
