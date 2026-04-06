"use client";

import {
  AlignLeft,
  Calendar,
  CheckSquare,
  ChevronDown,
  CircleDot,
  Info,
  Pipette,
  SlidersHorizontal,
  Star,
  TextCursorInput,
  ToggleLeft,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { z } from "zod";
import type {
  FieldComponent,
  FieldComponentProps,
  FormFieldDefinition,
  FormFieldEntry,
} from "@/registry/form-renderer/types";

// ─── Shadcn field components ──────────────────────────────────────────────────

const TextInput: FieldComponent = ({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  type,
  disabled,
  errors,
}: FieldComponentProps & {
  label?: string;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) => (
  <div className="flex flex-col gap-1.5">
    {label && <Label>{label}</Label>}
    <Input
      type={(type as string) ?? "text"}
      value={(value as string) ?? ""}
      placeholder={placeholder as string}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
    />
    {errors?.[0] && <p className="text-xs text-destructive">{errors[0]}</p>}
  </div>
);

const TextareaField: FieldComponent = ({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  rows,
  disabled,
  errors,
}: FieldComponentProps & {
  label?: string;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
}) => (
  <div className="flex flex-col gap-1.5">
    {label && <Label>{label}</Label>}
    <Textarea
      value={(value as string) ?? ""}
      placeholder={placeholder as string}
      rows={(rows as number) ?? 3}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
    />
    {errors?.[0] && <p className="text-xs text-destructive">{errors[0]}</p>}
  </div>
);

const SelectField: FieldComponent = ({
  label,
  value,
  onChange,
  onBlur,
  options,
  placeholder,
  disabled,
  errors,
}: FieldComponentProps & {
  label?: string;
  options?: string[];
  placeholder?: string;
  disabled?: boolean;
}) => (
  <div className="flex flex-col gap-1.5">
    {label && <Label>{label}</Label>}
    <Select
      value={(value as string) ?? ""}
      onValueChange={(val) => onChange(val)}
      disabled={disabled}
    >
      <SelectTrigger className="w-full" onBlur={onBlur}>
        <SelectValue placeholder={(placeholder as string) ?? "Select…"} />
      </SelectTrigger>
      <SelectContent>
        {((options as string[]) ?? []).map((opt) => (
          <SelectItem key={opt} value={opt}>
            {opt}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    {errors?.[0] && <p className="text-xs text-destructive">{errors[0]}</p>}
  </div>
);

const CheckboxField: FieldComponent = ({
  label,
  value,
  onChange,
  onBlur,
  disabled,
  errors,
}: FieldComponentProps & { label?: string; disabled?: boolean }) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-2">
      <Checkbox
        checked={(value as boolean) ?? false}
        disabled={disabled}
        onCheckedChange={(checked) => onChange(checked)}
        onBlur={onBlur}
      />
      {label && <Label className="cursor-pointer">{label}</Label>}
    </div>
    {errors?.[0] && <p className="text-xs text-destructive">{errors[0]}</p>}
  </div>
);

const RadioGroupField: FieldComponent = ({
  label,
  value,
  onChange,
  onBlur,
  options,
  disabled,
  errors,
}: FieldComponentProps & { label?: string; options?: string[]; disabled?: boolean }) => (
  <div className={cn("flex flex-col gap-2", disabled && "pointer-events-none opacity-50")}>
    {label && <Label>{label}</Label>}
    <RadioGroup
      value={(value as string) ?? ""}
      onValueChange={(val) => onChange(val)}
      className="gap-1.5"
      onBlur={onBlur}
    >
      {((options as string[]) ?? []).map((opt) => (
        <div key={opt} className="flex items-center gap-2">
          <RadioGroupItem value={opt} id={`radio-${opt}`} />
          <Label htmlFor={`radio-${opt}`} className="cursor-pointer font-normal">
            {opt}
          </Label>
        </div>
      ))}
    </RadioGroup>
    {errors?.[0] && <p className="text-xs text-destructive">{errors[0]}</p>}
  </div>
);

const SwitchField: FieldComponent = ({
  label,
  value,
  onChange,
  onBlur,
  disabled,
  errors,
}: FieldComponentProps & { label?: string; disabled?: boolean }) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-2">
      <Switch
        checked={(value as boolean) ?? false}
        disabled={disabled}
        onCheckedChange={(checked) => onChange(checked)}
        onBlur={onBlur}
      />
      {label && <Label className="cursor-pointer">{label}</Label>}
    </div>
    {errors?.[0] && <p className="text-xs text-destructive">{errors[0]}</p>}
  </div>
);

const SliderField: FieldComponent = ({
  label,
  value,
  onChange,
  onBlur,
  min,
  max,
  step,
  disabled,
  errors,
}: FieldComponentProps & {
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}) => {
  const minVal = (min as number) ?? 0;
  const maxVal = (max as number) ?? 100;
  const numVal = typeof value === "number" ? value : minVal;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        {label && <Label>{label}</Label>}
        <span className="text-sm text-muted-foreground tabular-nums">{numVal}</span>
      </div>
      <Slider
        value={[numVal]}
        disabled={disabled}
        onValueChange={(vals) => onChange(Array.isArray(vals) ? vals[0] : vals)}
        onBlur={onBlur}
        min={minVal}
        max={maxVal}
        step={(step as number) ?? 1}
      />
      {errors?.[0] && <p className="text-xs text-destructive">{errors[0]}</p>}
    </div>
  );
};

// ─── Existing custom fields ───────────────────────────────────────────────────

const ColorPicker: FieldComponent = ({
  label,
  value,
  onChange,
  onBlur,
  errors,
}: FieldComponentProps & { label?: string }) => (
  <div className="flex flex-col gap-1.5">
    {label && <Label>{label}</Label>}
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={(value as string) ?? "#000000"}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className="h-9 w-14 cursor-pointer rounded-md border border-input p-1"
      />
      <span className="text-sm text-muted-foreground font-mono">
        {(value as string) ?? "#000000"}
      </span>
    </div>
    {errors?.[0] && <p className="text-xs text-destructive">{errors[0]}</p>}
  </div>
);

const DateInput: FieldComponent = ({
  label,
  value,
  onChange,
  onBlur,
  min,
  max,
  disabled,
  errors,
}: FieldComponentProps & { label?: string; min?: string; max?: string; disabled?: boolean }) => (
  <div className="flex flex-col gap-1.5">
    {label && <Label>{label}</Label>}
    <input
      type="date"
      value={(value as string) ?? ""}
      min={min}
      max={max}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      className={cn(
        "h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm",
        "focus:outline-none focus:ring-1 focus:ring-ring"
      )}
    />
    {errors?.[0] && <p className="text-xs text-destructive">{errors[0]}</p>}
  </div>
);

const RatingInput: FieldComponent = ({
  label,
  value,
  onChange,
  max = 5,
  disabled,
  errors,
}: FieldComponentProps & { label?: string; max?: number; disabled?: boolean }) => {
  const current = Number(value) || 0;
  const stars = (max as number) ?? 5;
  return (
    <div className={cn("flex flex-col gap-1.5", disabled && "pointer-events-none opacity-50")}>
      {label && <Label>{label}</Label>}
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
      {errors?.[0] && <p className="text-xs text-destructive">{errors[0]}</p>}
    </div>
  );
};

// ─── Display components ───────────────────────────────────────────────────────

type AlertVariant = "info" | "success" | "warning" | "error";

const ALERT_STYLES: Record<AlertVariant, { container: string; icon: string }> = {
  info: {
    container:
      "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200",
    icon: "text-blue-500 dark:text-blue-400",
  },
  success: {
    container:
      "border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950/40 dark:text-green-200",
    icon: "text-green-500 dark:text-green-400",
  },
  warning: {
    container:
      "border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-200",
    icon: "text-yellow-500 dark:text-yellow-400",
  },
  error: {
    container:
      "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200",
    icon: "text-red-500 dark:text-red-400",
  },
};

const AlertBox: FieldComponent = ({ title, message, variant = "info" }: FieldComponentProps) => {
  const v = (variant as AlertVariant) in ALERT_STYLES ? (variant as AlertVariant) : "info";
  const styles = ALERT_STYLES[v];
  return (
    <div className={cn("flex gap-3 rounded-md border px-4 py-3 text-sm", styles.container)}>
      <Info className={cn("mt-0.5 h-4 w-4 shrink-0", styles.icon)} />
      <div className="flex flex-col gap-0.5">
        {title ? <p className="font-medium leading-snug">{String(title)}</p> : null}
        {message ? <p className="leading-snug opacity-90">{String(message)}</p> : null}
      </div>
    </div>
  );
};

// ─── Exports ──────────────────────────────────────────────────────────────────

const CUSTOM_COMPONENTS: Record<string, FieldComponent> = {
  TextInput,
  TextareaField,
  SelectField,
  CheckboxField,
  RadioGroupField,
  SwitchField,
  SliderField,
  ColorPicker,
  DateInput,
  RatingInput,
  AlertBox,
};

const CUSTOM_FIELD_DEFS: FormFieldDefinition[] = [
  // ── Shadcn fields ──
  {
    fieldType: "TextInput",
    displayName: "Text Input",
    icon: TextCursorInput,
    category: "Input",
    defaultProps: { label: "Input", placeholder: "", type: "text", value: null },
    defaultValue: "",
    configurableProps: [
      { key: "label", label: "Label", inputType: "text" },
      { key: "name", label: "Field Name", inputType: "text" },
      { key: "placeholder", label: "Placeholder", inputType: "text" },
      {
        key: "type",
        label: "Type",
        inputType: "select",
        options: ["text", "email", "password", "number", "url", "tel"],
      },
    ],
  },
  {
    fieldType: "TextareaField",
    displayName: "Textarea",
    icon: AlignLeft,
    category: "Input",
    defaultProps: { label: "Textarea", placeholder: "", rows: 3, value: null },
    defaultValue: "",
    configurableProps: [
      { key: "label", label: "Label", inputType: "text" },
      { key: "name", label: "Field Name", inputType: "text" },
      { key: "placeholder", label: "Placeholder", inputType: "text" },
      { key: "rows", label: "Rows", inputType: "number" },
    ],
  },
  {
    fieldType: "SelectField",
    displayName: "Select",
    icon: ChevronDown,
    category: "Choice",
    defaultProps: {
      label: "Select",
      placeholder: "Select…",
      options: ["Option 1", "Option 2", "Option 3"],
      value: null,
    },
    defaultValue: "",
    configurableProps: [
      { key: "label", label: "Label", inputType: "text" },
      { key: "name", label: "Field Name", inputType: "text" },
      { key: "placeholder", label: "Placeholder", inputType: "text" },
      { key: "options", label: "Options", inputType: "options-list" },
    ],
  },
  {
    fieldType: "CheckboxField",
    displayName: "Checkbox",
    icon: CheckSquare,
    category: "Choice",
    defaultProps: { label: "I agree to the terms", value: null },
    defaultValue: false,
    configurableProps: [
      { key: "label", label: "Label", inputType: "text" },
      { key: "name", label: "Field Name", inputType: "text" },
    ],
  },
  {
    fieldType: "RadioGroupField",
    displayName: "Radio Group",
    icon: CircleDot,
    category: "Choice",
    defaultProps: {
      label: "Radio Group",
      options: ["Option 1", "Option 2", "Option 3"],
      value: null,
    },
    defaultValue: "",
    configurableProps: [
      { key: "label", label: "Label", inputType: "text" },
      { key: "name", label: "Field Name", inputType: "text" },
      { key: "options", label: "Options", inputType: "options-list" },
    ],
  },
  {
    fieldType: "SwitchField",
    displayName: "Switch",
    icon: ToggleLeft,
    category: "Choice",
    defaultProps: { label: "Enable feature", value: null },
    defaultValue: false,
    configurableProps: [
      { key: "label", label: "Label", inputType: "text" },
      { key: "name", label: "Field Name", inputType: "text" },
    ],
  },
  {
    fieldType: "SliderField",
    displayName: "Slider",
    icon: SlidersHorizontal,
    category: "Input",
    defaultProps: { label: "Slider", min: 0, max: 100, step: 1, value: null },
    defaultValue: 50,
    validationSchema: z.coerce.number().min(0).max(100),
    configurableProps: [
      { key: "label", label: "Label", inputType: "text" },
      { key: "name", label: "Field Name", inputType: "text" },
      { key: "min", label: "Min", inputType: "number" },
      { key: "max", label: "Max", inputType: "number" },
      { key: "step", label: "Step", inputType: "number" },
    ],
  },
  // ── Custom fields ──
  {
    fieldType: "ColorPicker",
    displayName: "Color Picker",
    icon: Pipette,
    category: "Input",
    defaultProps: { label: "Color", value: null },
    defaultValue: "#000000",
    validationSchema: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color"),
    configurableProps: [
      { key: "label", label: "Label", inputType: "text" },
      { key: "name", label: "Field Name", inputType: "text" },
    ],
  },
  {
    fieldType: "DateInput",
    displayName: "Date Picker",
    icon: Calendar,
    category: "Input",
    defaultProps: { label: "Date", value: null, min: null, max: null },
    defaultValue: "",
    validationSchema: z.string().date("Must be a valid date"),
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
    category: "Input",
    defaultProps: { label: "Rating", value: null, max: 5 },
    defaultValue: 0,
    validationSchema: z.coerce.number().min(0).max(5),
    configurableProps: [
      { key: "label", label: "Label", inputType: "text" },
      { key: "name", label: "Field Name", inputType: "text" },
      { key: "max", label: "Max Stars", inputType: "number" },
    ],
  },
  // ── Display components ──
  {
    fieldType: "AlertBox",
    displayName: "Alert Box",
    icon: Info,
    category: "Display",
    isStructural: true,
    defaultProps: {
      title: "Heads up!",
      message: "This is an informational message.",
      variant: "info",
    },
    configurableProps: [
      { key: "title", label: "Title", inputType: "text" },
      { key: "message", label: "Message", inputType: "text" },
      {
        key: "variant",
        label: "Variant",
        inputType: "select",
        options: ["info", "success", "warning", "error"],
      },
    ],
  },
];

export const CUSTOM_CATALOG: FormFieldEntry[] = CUSTOM_FIELD_DEFS.map((def) => ({
  ...def,
  component: CUSTOM_COMPONENTS[def.fieldType]!,
}));
