"use client";

import {
  AlignLeft,
  Calendar,
  CheckSquare,
  ChevronDown,
  CircleDot,
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
import type {
  FieldComponent,
  FieldComponentProps,
  FormFieldDefinition,
} from "@/registry/form-renderer/types";

// ─── Shadcn field components ──────────────────────────────────────────────────

const TextInput: FieldComponent = ({
  label,
  value,
  onChange,
  placeholder,
  type,
}: FieldComponentProps & {
  label?: string;
  placeholder?: string;
  type?: string;
}) => (
  <div className="flex flex-col gap-1.5">
    {label && <Label>{label}</Label>}
    <Input
      type={(type as string) ?? "text"}
      value={(value as string) ?? ""}
      placeholder={placeholder as string}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const TextareaField: FieldComponent = ({
  label,
  value,
  onChange,
  placeholder,
  rows,
}: FieldComponentProps & {
  label?: string;
  placeholder?: string;
  rows?: number;
}) => (
  <div className="flex flex-col gap-1.5">
    {label && <Label>{label}</Label>}
    <Textarea
      value={(value as string) ?? ""}
      placeholder={placeholder as string}
      rows={(rows as number) ?? 3}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const SelectField: FieldComponent = ({
  label,
  value,
  onChange,
  options,
  placeholder,
}: FieldComponentProps & {
  label?: string;
  options?: string[];
  placeholder?: string;
}) => (
  <div className="flex flex-col gap-1.5">
    {label && <Label>{label}</Label>}
    <Select value={(value as string) ?? ""} onValueChange={(val) => onChange(val)}>
      <SelectTrigger className="w-full">
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
  </div>
);

const CheckboxField: FieldComponent = ({
  label,
  value,
  onChange,
}: FieldComponentProps & { label?: string }) => (
  <div className="flex items-center gap-2">
    <Checkbox
      checked={(value as boolean) ?? false}
      onCheckedChange={(checked) => onChange(checked)}
    />
    {label && <Label className="cursor-pointer">{label}</Label>}
  </div>
);

const RadioGroupField: FieldComponent = ({
  label,
  value,
  onChange,
  options,
}: FieldComponentProps & { label?: string; options?: string[] }) => (
  <div className="flex flex-col gap-2">
    {label && <Label>{label}</Label>}
    <RadioGroup
      value={(value as string) ?? ""}
      onValueChange={(val) => onChange(val)}
      className="gap-1.5"
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
  </div>
);

const SwitchField: FieldComponent = ({
  label,
  value,
  onChange,
}: FieldComponentProps & { label?: string }) => (
  <div className="flex items-center gap-2">
    <Switch
      checked={(value as boolean) ?? false}
      onCheckedChange={(checked) => onChange(checked)}
    />
    {label && <Label className="cursor-pointer">{label}</Label>}
  </div>
);

const SliderField: FieldComponent = ({
  label,
  value,
  onChange,
  min,
  max,
  step,
}: FieldComponentProps & {
  label?: string;
  min?: number;
  max?: number;
  step?: number;
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
        onValueChange={(vals) => onChange(Array.isArray(vals) ? vals[0] : vals)}
        min={minVal}
        max={maxVal}
        step={(step as number) ?? 1}
      />
    </div>
  );
};

// ─── Existing custom fields ───────────────────────────────────────────────────

const ColorPicker: FieldComponent = ({
  label,
  value,
  onChange,
}: FieldComponentProps & { label?: string }) => (
  <div className="flex flex-col gap-1.5">
    {label && <Label>{label}</Label>}
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
    {label && <Label>{label}</Label>}
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
  const stars = (max as number) ?? 5;
  return (
    <div className="flex flex-col gap-1.5">
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
    </div>
  );
};

// ─── Exports ──────────────────────────────────────────────────────────────────

export const CUSTOM_COMPONENTS: Record<string, FieldComponent> = {
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
};

export const CUSTOM_FIELD_DEFS: FormFieldDefinition[] = [
  // ── Shadcn fields ──
  {
    fieldType: "TextInput",
    displayName: "Text Input",
    icon: TextCursorInput,
    category: "Input",
    defaultProps: { label: "Label", placeholder: "", type: "text", value: null },
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
    defaultProps: { label: "Label", placeholder: "", rows: 3, value: null },
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
      label: "Label",
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
      label: "Label",
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
    defaultProps: { label: "Label", min: 0, max: 100, step: 1, value: null },
    defaultValue: 50,
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
    configurableProps: [
      { key: "label", label: "Label", inputType: "text" },
      { key: "name", label: "Field Name", inputType: "text" },
      { key: "max", label: "Max Stars", inputType: "number" },
    ],
  },
];
