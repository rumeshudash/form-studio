# Form Studio — LLM FormSchema Reference

Use this file as the sole reference when generating a `FormSchema` for Form Studio.

Form Studio is a shadcn/ui registry. Consumers install `form-renderer` and/or `form-builder` into their own project and register whatever field types they need. **The `type` string in every `FormField` references a key from the consumer's own field catalog — it is not fixed.** Before generating a schema, you must know which field types the consumer has registered and what props each one accepts.

---

## 1. Core schema structure

```ts
interface FormSchema {
  title?: string;        // optional heading above the form
  description?: string;  // optional subtitle
  fields: FormItem[];    // ordered list of fields and/or grid rows — see sections 2 and 3
  layout?: {
    gap?: "none" | "sm" | "md" | "lg" | "xl";             // spacing between fields, default "md"
    align?: "start" | "center" | "end" | "stretch";
    justify?: "start" | "center" | "end" | "between" | "around";
  };
  submit?: {
    label?: string;                                                       // default "Submit"
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";  // default "primary"
    disabled?: boolean;                                                   // default false
  };
}
```

`fields` is an ordered array where each entry is either a `**FormField**` (a single field) or a `**FormRow**` (a grid of fields side-by-side).

---

## 2. `FormField`

```ts
interface FormField {
  type: string;                    // field type key from the consumer's catalog (e.g. "TextInput", "DatePicker")
  name?: string;                   // state key — REQUIRED for every non-structural field; omit only for display-only fields
  defaultValue?: unknown;          // initial form value — omit to use the catalog's built-in default
  props?: Record<string, unknown>; // label, placeholder, options, etc. — whatever the field component accepts
  validation?: FieldValidationRule[];
  conditions?: FieldCondition[];
}
```

### What goes in `props`

`props` is passed directly to the field component. The available keys depend entirely on the consumer's field catalog. Common conventions across most catalogs:

- `label` — visible label shown above or beside the input
- `placeholder` — hint text inside the input
- `disabled` — boolean, disables the field

Always check the consumer's catalog definition for the exact props a field accepts.

### Structural fields

Some field types are purely decorative (headings, alert banners, separators). They:

- Must **not** have a `name`
- Must **not** have `validation` or `conditions`
- Do not appear in the submitted form data

The consumer's catalog marks these with `isStructural: true`.

---

## 3. `FormRow` (Grid)

Wrap multiple fields in a grid to render them side-by-side.

```ts
interface FormRow {
  type: "Grid";           // always exactly "Grid"
  columns: 2 | 3;         // number of columns
  gap?: "none" | "sm" | "md" | "lg" | "xl";  // default "md"
  fields: FormField[];    // flat array of FormField — NO nested Grids
}
```

Example:

```json
{
  "type": "Grid",
  "columns": 2,
  "fields": [
    { "type": "TextInput", "name": "firstName", "props": { "label": "First Name" } },
    { "type": "TextInput", "name": "lastName",  "props": { "label": "Last Name" } }
  ]
}
```

---

## 4. Validation

### `FieldValidationRule`

```ts
interface FieldValidationRule {
  type: "required" | "pattern";
  message?: string;        // custom error text; falls back to a built-in default if omitted
  value?: string;          // required for: pattern (regex string)
}
```

### Rule types

| `type` | Needs `value`? | Default message | When to use |
|---|---|---|---|
| `required` | No | `"This field is required"` | Any field that must have a value |
| `pattern` | Yes (regex string) | `"Invalid format"` | Custom format constraint; multiple allowed, each applied independently |

> Note: Some field types in the consumer's catalog may carry a `validationSchema` (a Zod schema) that enforces format constraints automatically when the field is marked `required`. For example, a `ColorPicker` field might reject non-hex strings without any explicit `pattern` rule. The catalog documentation will call this out. Format-level rules (email, URL, length, numeric range) belong in the catalog's `validationSchema`, not in the schema's `validation` array.

### Validation examples

```json
{ "type": "required" }
{ "type": "required", "message": "Please enter your full name" }
{ "type": "pattern", "value": "^[a-zA-Z0-9_]+$", "message": "Only letters, numbers, and underscores" }
{ "type": "pattern", "value": "^.{8,}$", "message": "At least 8 characters" }
```

Multiple patterns are applied independently — all must pass:

```json
"validation": [
  { "type": "required" },
  { "type": "pattern", "value": "^[a-zA-Z0-9_]+$", "message": "Only letters, numbers, and underscores" },
  { "type": "pattern", "value": "^.{3,20}$", "message": "Between 3 and 20 characters" }
]
```

---

## 5. Conditional logic

Fields can be shown/hidden, enabled/disabled, or have their value computed based on another field's value.

### `FieldCondition`

```ts
interface FieldCondition {
  triggerField: string;              // name of the field to watch
  operator: ConditionOperator;
  value?: string | number | boolean; // comparison value — not needed for "truthy" / "falsy"
  action: ConditionAction;
  computeValue?: string;             // only used when action is "compute"
}
```

### Operators


| `operator` | Meaning                         | Needs `value`? |
| ---------- | ------------------------------- | -------------- |
| `"eq"`     | equals                          | Yes            |
| `"neq"`    | not equals                      | Yes            |
| `"gt"`     | greater than                    | Yes            |
| `"gte"`    | greater than or equal           | Yes            |
| `"lt"`     | less than                       | Yes            |
| `"lte"`    | less than or equal              | Yes            |
| `"truthy"` | field has any truthy value      | No             |
| `"falsy"`  | field has a falsy / empty value | No             |


### Actions


| `action`    | Effect                                                           |
| ----------- | ---------------------------------------------------------------- |
| `"show"`    | Show this field when condition is met (hidden otherwise)         |
| `"hide"`    | Hide this field when condition is met (shown otherwise)          |
| `"enable"`  | Enable this field when condition is met (disabled otherwise)     |
| `"disable"` | Disable this field when condition is met (enabled otherwise)     |
| `"compute"` | Set this field's value from `computeValue` when condition is met |


### `computeValue` syntax


| Syntax              | Meaning                                     |
| ------------------- | ------------------------------------------- |
| `"someString"`      | Set the field to this literal string value  |
| `"@otherFieldName"` | Copy the current value from the named field |


### Condition examples

```json
{ "triggerField": "plan", "operator": "eq", "value": "pro", "action": "show" }
```

```json
{ "triggerField": "agreed", "operator": "falsy", "action": "disable" }
```

```json
{ "triggerField": "sameAsPrimary", "operator": "truthy", "action": "compute", "computeValue": "@primaryEmail" }
```

A field can have multiple conditions — each is evaluated independently:

```json
"conditions": [
  { "triggerField": "role", "operator": "eq", "value": "admin", "action": "show" },
  { "triggerField": "verified", "operator": "falsy", "action": "disable" }
]
```

---

## 6. Hard constraints

- Every non-structural field **must** have a `name`.
- `name` values must be **unique** across the entire schema (including inside grids).
- `name` must be a valid JavaScript identifier — no spaces, dots, or hyphens. Use `camelCase` or `snake_case`.
- `type: "Grid"` is a `FormRow`, not a `FormField` — it must have `columns` and `fields`, never `name` or `validation`.
- Grid `fields` is a **flat array** — grids cannot contain other grids.
- `validation` and `conditions` have no effect on fields without a `name`.
- `conditions[].triggerField` must match the `name` of another field present in the same schema.
- Fields with `isStructural: true` in the catalog must not have `name`, `validation`, or `conditions`.

---

## 7. Anti-patterns

```jsonc
// WRONG — non-structural field missing name
{ "type": "TextInput", "props": { "label": "Email" } }

// WRONG — name with a space
{ "type": "TextInput", "name": "first name", "props": { "label": "First Name" } }

// WRONG — Grid nested inside a Grid
{
  "type": "Grid", "columns": 2, "fields": [
    { "type": "Grid", "columns": 2, "fields": [...] }  // not allowed
  ]
}

// WRONG — Grid treated as a FormField (has name/validation)
{ "type": "Grid", "name": "row1", "columns": 2, "fields": [...] }

// WRONG — condition references a field not in the schema
{ "conditions": [{ "triggerField": "doesNotExist", "operator": "truthy", "action": "show" }] }

// WRONG — structural field given a name and validation
{ "type": "AlertBox", "name": "notice", "validation": [...], "props": { "title": "Note" } }
```

---

## 8. How to generate a schema

### Step 1 — Know the catalog

Before writing any schema, you must know which field types are available and what props each accepts. Ask the consumer:

> "What field types are registered in your catalog? For each one, what props does it accept?"

A catalog entry typically looks like:

```ts
{
  fieldType: "DatePicker",       // the string to use as `type` in a FormField
  defaultValue: "",              // the initial form value when none is set
  configurableProps: [           // the props the builder/user can configure
    { key: "label",       label: "Label",     inputType: "text" },
    { key: "placeholder", label: "Placeholder", inputType: "text" },
    { key: "minDate",     label: "Min Date",  inputType: "text" },
  ],
  validationSchema: z.string().date(),  // if present: format enforced automatically on required fields
}
```

### Step 2 — Map requirements to fields

Match each piece of data you need to collect to the most appropriate field type in the catalog.

### Step 3 — Write the schema

Assemble a `FormSchema` object using the patterns in this document. Use `type: "Grid"` for side-by-side layout. Add `validation` where input must be enforced. Add `conditions` for dynamic show/hide or computed values.

---

## 9. Catalog creation guide

A **catalog** is the list of field types available to both the builder and the renderer. You define it once and pass the same array to both components. Each entry is a `FormFieldEntry` — a React component bundled together with its metadata.

### 9.1 Interfaces

```ts
// The React component that renders the field
type FieldComponent = React.ComponentType<FieldComponentProps>

interface FieldComponentProps {
  value: unknown;               // current form value (always provided)
  onChange: (value: unknown) => void;  // call this when the value changes
  onBlur?: () => void;          // call this when the field loses focus (triggers validation)
  errors?: string[];            // array of active error messages (show errors?.[0])
  isValid?: boolean;            // true when there are no errors
  [key: string]: unknown;       // any extra props from FormField.props are spread in here
}
```

```ts
interface FormFieldDefinition {
  fieldType: string;            // unique key — used as `type` in FormSchema
  displayName: string;          // label shown in the builder palette
  icon: React.ComponentType<{ className?: string }>; // icon for the builder palette
  category: string;             // palette group (e.g. "Input", "Choice", "Display")
  defaultProps: Record<string, unknown>; // props applied when the field is first dropped onto the canvas
  defaultValue?: unknown;       // initial form state value (default: "")
  isStructural?: boolean;       // true = display-only, no form state, no name/validation
  validationSchema?: z.ZodTypeAny; // catalog-level Zod schema — applied automatically when required
  configurableProps: ConfigurableProp[]; // which props the builder sidebar exposes to the form author
}

// A complete catalog entry = definition + component
interface FormFieldEntry extends FormFieldDefinition {
  component: FieldComponent;
}
```

```ts
interface ConfigurableProp {
  key: string;       // must match a key in defaultProps / props
  label: string;     // displayed in the builder sidebar
  inputType: "text" | "number" | "boolean" | "select" | "options-list";
  options?: string[]; // required when inputType is "select"
}
```

### 9.2 `configurableProps` input types

| `inputType` | Renders as | `value` type | Use for |
|---|---|---|---|
| `"text"` | Text input | `string` | label, placeholder, date strings |
| `"number"` | Number input | `number` | min, max, step, rows |
| `"boolean"` | Checkbox | `boolean` | disabled, required, etc. |
| `"select"` | Dropdown | `string` | fixed option sets (provide `options`) |
| `"options-list"` | Textarea (one per line) | `string[]` | dynamic option arrays |

### 9.3 `validationSchema`

Add `validationSchema` to enforce format constraints that are intrinsic to the field type — constraints that should always apply regardless of who builds the form.

```ts
// Good candidates for validationSchema
validationSchema: z.string().email("Must be a valid email")
validationSchema: z.string().url("Must be a valid URL")
validationSchema: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color")
validationSchema: z.string().date("Must be a valid date (YYYY-MM-DD)")
validationSchema: z.coerce.number().min(0).max(100)
```

When the field is marked `required` in the schema, the renderer extends `validationSchema` with a non-empty check automatically. When the field is not required, `validationSchema` is skipped entirely (empty optional fields are never rejected).

Do **not** add `validationSchema` to generic text inputs — those have no intrinsic format constraint.

### 9.4 Structural fields

Set `isStructural: true` for fields that display information but do not collect data (headings, alerts, dividers, etc.). Structural fields:

- Do not bind to form state
- Must not receive `name`, `validation`, or `conditions` in the schema
- Should not include `defaultValue`

### 9.5 Complete worked example — interactive field

```tsx
import { z } from "zod"
import { Phone } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { FieldComponent, FormFieldEntry } from "@/components/form-renderer/types"

// 1. The React component
const PhoneInput: FieldComponent = ({ label, value, onChange, onBlur, placeholder, errors }) => (
  <div className="flex flex-col gap-1.5">
    {label && <Label>{String(label)}</Label>}
    <Input
      type="tel"
      value={(value as string) ?? ""}
      placeholder={(placeholder as string) ?? "+1 (555) 000-0000"}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
    />
    {errors?.[0] && <p className="text-xs text-destructive">{errors[0]}</p>}
  </div>
)

// 2. The catalog entry
export const phoneEntry: FormFieldEntry = {
  fieldType: "PhoneInput",           // used as `type` in FormSchema
  displayName: "Phone Number",
  icon: Phone,
  category: "Input",
  defaultProps: { label: "Phone", placeholder: "+1 (555) 000-0000" },
  defaultValue: "",
  // Enforced automatically when the field is marked required
  validationSchema: z.string().regex(
    /^\+?[1-9]\d{7,14}$/,
    "Must be a valid international phone number"
  ),
  configurableProps: [
    { key: "label",       label: "Label",       inputType: "text" },
    { key: "name",        label: "Field Name",  inputType: "text" },
    { key: "placeholder", label: "Placeholder", inputType: "text" },
  ],
  component: PhoneInput,
}
```

Using this entry in a schema:

```json
{
  "type": "PhoneInput",
  "name": "mobile",
  "props": { "label": "Mobile Number" },
  "validation": [{ "type": "required" }]
}
```

### 9.6 Complete worked example — structural field

```tsx
import { Minus } from "lucide-react"
import type { FieldComponent, FormFieldEntry } from "@/components/form-renderer/types"

const Divider: FieldComponent = ({ spacing }) => (
  <hr className={spacing === "lg" ? "my-6" : "my-3"} />
)

export const dividerEntry: FormFieldEntry = {
  fieldType: "Divider",
  displayName: "Divider",
  icon: Minus,
  category: "Display",
  isStructural: true,           // no form state, no name required
  defaultProps: { spacing: "md" },
  configurableProps: [
    { key: "spacing", label: "Spacing", inputType: "select", options: ["sm", "md", "lg"] },
  ],
  component: Divider,
}
```

Using this entry in a schema (no `name`, no `validation`):

```json
{ "type": "Divider", "props": { "spacing": "lg" } }
```

### 9.7 Assembling and passing the catalog

Combine all entries into a single array and pass it to both `FormBuilder` and `FormRenderer`:

```tsx
import { FormBuilder } from "@/components/form-builder"
import { FormRenderer } from "@/components/form-renderer"

const catalog = [phoneEntry, dividerEntry, /* ...other entries */]

// In the builder page
<FormBuilder catalog={catalog} onChange={setSchema} />

// In the renderer page
<FormRenderer schema={schema} catalog={catalog} onSubmit={handleSubmit} />
```

Both components use the same `catalog` array so field components, default props, and `validationSchema` are always in sync.

---

## 10. Generic examples

These examples use placeholder field types (`TextInput`, `SelectField`, etc.) to illustrate schema patterns. Replace them with the actual types from the consumer's catalog.

### Example A — Basic form with required validation

```json
{
  "title": "Contact Us",
  "fields": [
    {
      "type": "TextInput",
      "name": "fullName",
      "props": { "label": "Full Name", "placeholder": "Jane Doe" },
      "validation": [{ "type": "required" }]
    },
    {
      "type": "TextInput",
      "name": "email",
      "props": { "label": "Email", "placeholder": "jane@example.com" },
      "validation": [{ "type": "required" }]
    },
    {
      "type": "SelectField",
      "name": "subject",
      "props": {
        "label": "Subject",
        "options": ["General Inquiry", "Support", "Billing", "Other"]
      },
      "validation": [{ "type": "required" }]
    },
    {
      "type": "TextareaField",
      "name": "message",
      "props": { "label": "Message", "rows": 5 },
      "validation": [{ "type": "required" }]
    }
  ],
  "submit": { "label": "Send Message" }
}
```

### Example B — Two-column grid with a conditional field

```json
{
  "title": "Shipping Details",
  "fields": [
    {
      "type": "Grid",
      "columns": 2,
      "fields": [
        {
          "type": "TextInput",
          "name": "firstName",
          "props": { "label": "First Name" },
          "validation": [{ "type": "required" }]
        },
        {
          "type": "TextInput",
          "name": "lastName",
          "props": { "label": "Last Name" },
          "validation": [{ "type": "required" }]
        }
      ]
    },
    {
      "type": "TextInput",
      "name": "address",
      "props": { "label": "Address" },
      "validation": [{ "type": "required" }]
    },
    {
      "type": "SwitchField",
      "name": "differentBilling",
      "props": { "label": "Billing address is different from shipping" }
    },
    {
      "type": "TextInput",
      "name": "billingAddress",
      "props": { "label": "Billing Address" },
      "conditions": [
        { "triggerField": "differentBilling", "operator": "truthy", "action": "show" }
      ],
      "validation": [{ "type": "required" }]
    }
  ]
}
```

### Example C — Pattern validation and a structural display field

```json
{
  "title": "Create Account",
  "fields": [
    {
      "type": "AlertBox",
      "props": {
        "title": "Password rules",
        "message": "8–32 characters. Letters, numbers, and underscores only.",
        "variant": "info"
      }
    },
    {
      "type": "TextInput",
      "name": "username",
      "props": { "label": "Username" },
      "validation": [
        { "type": "required" },
        { "type": "pattern", "value": "^[a-zA-Z0-9_]+$", "message": "Letters, numbers, and underscores only" },
        { "type": "pattern", "value": "^.{3,20}$", "message": "3–20 characters" }
      ]
    },
    {
      "type": "TextInput",
      "name": "password",
      "props": { "label": "Password", "type": "password" },
      "validation": [
        { "type": "required" },
        { "type": "pattern", "value": "^.{8,32}$", "message": "8–32 characters" }
      ]
    },
    {
      "type": "CheckboxField",
      "name": "agreed",
      "props": { "label": "I accept the terms and conditions" },
      "validation": [{ "type": "required", "message": "You must accept the terms" }]
    }
  ],
  "submit": { "label": "Create Account" }
}
```

