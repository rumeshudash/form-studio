"use client";

import { Star, Pipette, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FieldComponent, FieldComponentProps, FormFieldDefinition } from "@/registry/form-renderer/types";

// ─── Custom field components ──────────────────────────────────────────────────
// These are plain React components — no @json-render imports needed.
// Receive `value` + `onChange` from the form renderer automatically.

const ColorPicker: FieldComponent = ({
  label,
  value,
  onChange,
}: FieldComponentProps & { label?: string }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium">{label}</label>
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={(value as string) ?? "#000000"}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-14 cursor-pointer rounded-md border border-input p-1"
      />
      <span className="text-sm text-muted-foreground font-mono">
        {(value as string) ?? "#000000"}
      </span>
    </div>
  </div>
);

const DateInput: FieldComponent = ({
  label,
  value,
  onChange,
  min,
  max,
}: FieldComponentProps & { label?: string; min?: string; max?: string }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium">{label}</label>
    <input
      type="date"
      value={(value as string) ?? ""}
      min={min}
      max={max}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm",
        "focus:outline-none focus:ring-1 focus:ring-ring"
      )}
    />
  </div>
);

const RatingInput: FieldComponent = ({
  label,
  value,
  onChange,
  max = 5,
}: FieldComponentProps & { label?: string; max?: number }) => {
  const current = Number(value) || 0;
  const stars = max ?? 5;
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex items-center gap-1">
        {Array.from({ length: stars }, (_, i) => i + 1).map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star === current ? 0 : star)}
            className="focus:outline-none"
            aria-label={`Rate ${star}`}
          >
            <Star
              className={cn(
                "h-6 w-6 transition-colors",
                star <= current
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground/40 hover:text-yellow-300"
              )}
            />
          </button>
        ))}
        {current > 0 && (
          <span className="ml-1 text-xs text-muted-foreground">
            {current}/{stars}
          </span>
        )}
      </div>
    </div>
  );
};

// ─── Custom field components map (passed to FormRenderer customFields) ────────

// Custom plain-React field components (passed via customFields prop)
export const CUSTOM_COMPONENTS: Record<string, FieldComponent> = {
  ColorPicker,
  DateInput,
  RatingInput,
};

// ─── Custom field definitions for FormBuilder palette ────────────────────────

export const CUSTOM_FIELD_DEFS: FormFieldDefinition[] = [
  {
    fieldType: "ColorPicker",
    displayName: "Color Picker",
    icon: Pipette,
    category: "Choice",
    defaultProps: { label: "Color", value: null },
    defaultValue: "#000000",
    configurableProps: [
      { key: "label", label: "Label", inputType: "text" },
      { key: "name", label: "Field Name", inputType: "text" },
    ],
  },
  {
    fieldType: "DateInput",
    displayName: "Date Picker",
    icon: Calendar,
    category: "Date",
    defaultProps: { label: "Date", value: null, min: null, max: null },
    defaultValue: "",
    configurableProps: [
      { key: "label", label: "Label", inputType: "text" },
      { key: "name", label: "Field Name", inputType: "text" },
      { key: "min", label: "Min Date", inputType: "text" },
      { key: "max", label: "Max Date", inputType: "text" },
    ],
  },
  {
    fieldType: "RatingInput",
    displayName: "Star Rating",
    icon: Star,
    category: "Display",
    defaultProps: { label: "Rating", value: null, max: 5 },
    defaultValue: 0,
    configurableProps: [
      { key: "label", label: "Label", inputType: "text" },
      { key: "name", label: "Field Name", inputType: "text" },
      { key: "max", label: "Max Stars", inputType: "number" },
    ],
  },
];
