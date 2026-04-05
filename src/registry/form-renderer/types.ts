// ─── Developer-facing schema ──────────────────────────────────────────────────

export interface FormField {
  type: string;           // component type ("TextInput", "SelectField", etc.)
  name?: string;          // state key — required for non-structural fields
  defaultValue?: unknown; // initial form value (defaults to "")
  [key: string]: unknown; // label, placeholder, options, and any other props
}

export interface FormRow {
  type: "Grid";
  columns: 2 | 3;
  gap?: "none" | "sm" | "md" | "lg" | "xl";
  fields: FormField[];
}

export type FormItem = FormField | FormRow;

export interface FormSchema {
  title?: string;
  description?: string;
  fields: FormItem[];
  layout?: {
    gap?: "none" | "sm" | "md" | "lg" | "xl";
    align?: "start" | "center" | "end" | "stretch";
    justify?: "start" | "center" | "end" | "between" | "around";
  };
  submit?: {
    label?: string;
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
    disabled?: boolean;
  };
}

// ─── Builder types ────────────────────────────────────────────────────────────

// Open string type — built-in values documented, custom types accepted.
// Built-ins: "Input" | "Textarea" | "Select" | "Checkbox" | "Radio" | "Switch" | "Slider"
export type FieldType = string;

export interface CanvasField {
  kind: "field";
  id: string;
  elementKey: string;
  fieldType: FieldType;
  props: Record<string, unknown>;
}

export interface CanvasGrid {
  kind: "grid";
  id: string;
  elementKey: string;
  columns: 2 | 3;
  fields: CanvasField[];
}

export type CanvasItem = CanvasField | CanvasGrid;

export interface StackConfig {
  gap: "none" | "sm" | "md" | "lg" | "xl";
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around";
}

export interface ButtonConfig {
  label: string;
  variant: "primary" | "secondary" | "outline" | "ghost" | "danger";
  disabled: boolean;
}

export interface FormBuilderState {
  items: CanvasItem[];
  selectedFieldId: string | null;
  formTitle: string;
  formDescription: string;
  stackConfig: StackConfig;
  buttonConfig: ButtonConfig;
}

export interface ConfigurableProp {
  key: string;
  label: string;
  inputType: "text" | "select" | "boolean" | "number" | "options-list";
  options?: string[];
}

// Simple props passed to every custom field component.
// Consumers implement this interface — no @json-render knowledge required.
export interface FieldComponentProps {
  value: unknown;
  onChange: (value: unknown) => void;
  [key: string]: unknown;
}

export type FieldComponent = React.ComponentType<FieldComponentProps>;

export interface FormFieldDefinition {
  fieldType: FieldType;
  displayName: string;
  icon: React.ComponentType<{ className?: string }>;
  // Built-ins: "text" | "choice" | "toggle" | "numeric" — custom categories accepted.
  category: string;
  defaultProps: Record<string, unknown>;
  // Which prop to $bindState — defaults to "value" if omitted (internal use only)
  boundProp?: string;
  // Default value for the bound prop in form state — defaults to ""
  defaultValue?: unknown;
  // Structural components (Separator, Heading, Text, Alert) — no state binding
  isStructural?: boolean;
  configurableProps: ConfigurableProp[];
}
