"use client";

type WorkbookCellOption = {
  label: string;
  value: string | number;
};

type WorkbookCellFieldProps = {
  label: string;
  kind: "input" | "select" | "formula" | "label";
  inputType?: "text" | "number" | "date";
  value: string | number;
  onChange?: (nextValue: string | number) => void;
  disabled?: boolean;
  options?: WorkbookCellOption[];
  step?: string;
  readOnlyHint?: string;
};

import { useSettings } from "@/components/providers/settings-provider";

export function WorkbookCellField({
  label,
  kind,
  inputType = "text",
  value,
  onChange,
  disabled = false,
  options = [],
  step = "0.01",
  readOnlyHint,
}: WorkbookCellFieldProps) {
  const { t } = useSettings();
  const displayValue = typeof value === "number" ? String(value) : value;

  return (
    <label className="block space-y-2">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
        {label}
      </span>
      {kind === "select" ? (
        <select
          value={String(value)}
          disabled={disabled}
          onChange={(event) => {
            const shouldCoerceToNumber = options.some((option) => typeof option.value === "number");
            onChange?.(shouldCoerceToNumber ? Number(event.target.value) : event.target.value);
          }}
          className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-brand/20 disabled:opacity-50"
        >
          {options.map((option) => (
            <option key={String(option.value)} value={String(option.value)} className="bg-card text-foreground">
              {option.label}
            </option>
          ))}
        </select>
      ) : kind === "label" ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 px-3 py-2 text-sm text-foreground/80">
          {displayValue}
        </div>
      ) : (
        <input
          type={kind === "formula" ? "text" : inputType}
          step={step}
          value={displayValue}
          readOnly={kind === "formula"}
          disabled={disabled}
          onChange={(event) => {
            if (kind === "formula") {
              return;
            }
            onChange?.(inputType === "number" ? Number(event.target.value) : event.target.value);
          }}
          className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-brand/20 disabled:opacity-50"
          aria-label={label}
        />
      )}
      {kind === "formula" ? (
        <p className="text-[11px] text-muted">{readOnlyHint || t("sensor.calculated")}</p>
      ) : null}
    </label>
  );
}
