# Form Studio

A [shadcn/ui registry](https://ui.shadcn.com/docs/registry) with a drag-and-drop form builder, a JSON schema renderer, and a ready-to-use block — all installable with a single command.

**[Docs & Registry](https://rumeshudash.github.io/form-studio)** · **[Live Demo](https://rumeshudash.github.io/form-studio/demo-builder)**

---

## Registry items


| Name                       | Type      | Description                                                                      |
| -------------------------- | --------- | -------------------------------------------------------------------------------- |
| `form-renderer`            | component | Renders a JSON schema into a form using `@json-render/react` + `react-hook-form` |
| `form-builder`             | component | Drag-and-drop builder that outputs a `FormSchema`                                |
| `form-builder-with-schema` | block     | Full-page block: builder + live schema panel (copyable) + form preview           |


## Installation

Make sure you have [shadcn/ui initialized](https://ui.shadcn.com/docs/installation), then add any item:

```bash
# Form Renderer only
npx shadcn@latest add "https://rumeshudash.github.io/form-studio/r/form-renderer.json"

# Form Builder (includes Form Renderer)
npx shadcn@latest add "https://rumeshudash.github.io/form-studio/r/form-builder.json"

# Full block — builder + schema panel + preview (includes everything above)
npx shadcn@latest add "https://rumeshudash.github.io/form-studio/r/form-builder-with-schema.json"
```

## Usage

### Form Renderer

```tsx
import { FormRenderer } from "@/components/form-renderer"
import type { FormSchema } from "@/components/form-renderer/types"

const schema: FormSchema = {
  title: "Contact",
  fields: [
    { type: "TextInput", name: "name", props: { label: "Name", placeholder: "John Doe" } },
    { type: "TextInput", name: "email", props: { label: "Email", type: "email" } },
  ],
  submit: { label: "Send" },
}

export default function Page() {
  return (
    <FormRenderer
      schema={schema}
      catalog={myFieldCatalog}
      onSubmit={(data) => console.log(data)}
    />
  )
}
```

### Form Builder

```tsx
import { FormBuilder } from "@/components/form-builder"
import type { FormSchema } from "@/components/form-renderer/types"

export default function Page() {
  return (
    <FormBuilder
      catalog={myFieldCatalog}   // FormFieldEntry[]
      onChange={(schema: FormSchema) => console.log(schema)}
      className="h-screen"
    />
  )
}
```

### Block

The block installs directly as a Next.js page at `app/form-builder/page.tsx`. Edit `custom-fields.tsx` alongside it to add or remove field types.

## Custom fields

Define your own field components and register them with both the builder and renderer via a shared `FormFieldEntry[]` catalog:

```tsx
import { z } from "zod"
import type { FieldComponent, FormFieldEntry } from "@/components/form-renderer/types"
import { Star } from "lucide-react"

const RatingInput: FieldComponent = ({ label, value, onChange }) => (
  // ... your component
)

export const ratingEntry: FormFieldEntry = {
  fieldType: "RatingInput",
  displayName: "Star Rating",
  icon: Star,
  category: "Input",
  defaultProps: { label: "Rating", value: null, max: 5 },
  defaultValue: 0,
  // Catalog-level validation — applied automatically by the renderer
  validationSchema: z.coerce.number().min(1, "Please select a rating").max(5),
  configurableProps: [
    { key: "label", label: "Label", inputType: "text" },
    { key: "max",   label: "Max Stars", inputType: "number" },
  ],
  component: RatingInput,
}
```

```tsx
// Pass the same catalog to both components
<FormBuilder catalog={[ratingEntry]} onChange={setSchema} />
<FormRenderer schema={schema} catalog={[ratingEntry]} onSubmit={...} />
```

## Validation

Validation is a two-layer system: **catalog-level** (Zod, set by field authors) and **builder-level** (set by form authors at build time).

### Catalog-level validation — `validationSchema`

Add a `validationSchema: z.ZodTypeAny` to any `FormFieldDefinition` to enforce format constraints intrinsic to that field type:

```ts
import { z } from "zod"

// In your field definition
{
  fieldType: "ColorPicker",
  // ...
  validationSchema: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color"),
}
```

The renderer applies `validationSchema` automatically according to these rules:


| Field marked required? | `validationSchema` present? | Behaviour                                                    |
| ---------------------- | --------------------------- | ------------------------------------------------------------ |
| Yes                    | Yes                         | `validationSchema` is used, extended with a non-empty check  |
| No                     | Yes                         | Schema is skipped (empty optional fields are never rejected) |
| Yes                    | No                          | Only `required` and `pattern` rules are applied              |
| No                     | No                          | No Zod schema generated                                      |


Built-in examples from `custom-fields.tsx`:


| Field         | `validationSchema`                                                   |
| ------------- | -------------------------------------------------------------------- |
| `ColorPicker` | `z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color")` |
| `DateInput`   | `z.string().date("Must be a valid date")`                            |
| `SliderField` | `z.coerce.number().min(0).max(100)`                                  |
| `RatingInput` | `z.coerce.number().min(0).max(5)`                                    |


### Builder-level validation

The form builder exposes two rules that form authors can configure per field:

- **Required** — marks the field as mandatory, with an optional custom error message
- **Pattern** — one or more regex rules, each with an optional custom error message

```ts
// FormSchema field with builder-level validation
{
  type: "TextInput",
  name: "username",
  validation: [
    { type: "required", message: "Username is required" },
    { type: "pattern", value: "^[a-zA-Z0-9_]+$", message: "Only letters, numbers, and underscores" },
    { type: "pattern", value: "^.{3,}$", message: "At least 3 characters" },
  ],
}
```

> Format rules (email, URL, number range, length) belong in the catalog via `validationSchema` — not in builder-level rules. This keeps the builder UI focused and ensures format constraints are always enforced consistently regardless of who builds the form.


## Conditional logic

Fields support conditional visibility, enable/disable, and computed values via a `conditions` array.

### `FieldCondition`

```ts
interface FieldCondition {
  triggerField: string;              // name of the field to watch
  operator: ConditionOperator;       // "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "truthy" | "falsy"
  value?: string | number | boolean; // comparison value (not needed for truthy/falsy)
  action: ConditionAction;           // "show" | "hide" | "enable" | "disable" | "compute"
  computeValue?: string;             // literal or "@otherFieldName" to copy a value
}
```

### Examples

```ts
// Show this field only when "plan" equals "pro"
{
  type: "TextInput",
  name: "proFeature",
  conditions: [
    { triggerField: "plan", operator: "eq", value: "pro", action: "show" },
  ],
}

// Disable when "agreed" is falsy
{
  type: "TextInput",
  name: "signature",
  conditions: [
    { triggerField: "agreed", operator: "falsy", action: "disable" },
  ],
}

// Copy value from another field
{
  type: "TextInput",
  name: "billingEmail",
  conditions: [
    { triggerField: "sameAsContact", operator: "truthy", action: "compute", computeValue: "@contactEmail" },
  ],
}
```

The builder UI exposes condition editing for all non-structural fields. Multiple conditions on one field are evaluated independently (each action applies if its condition is met).

## Development

```bash
npm install
npm run dev          # dev server at http://localhost:3000
npm run registry:build   # regenerate public/r/*.json
npm run build        # static export → out/
```

### GitHub Pages deployment

The included `.github/workflows/deploy.yml` automatically:

1. Builds the registry (`public/r/*.json`)
2. Runs `next build` (static export to `out/`)
3. Deploys to GitHub Pages

Enable it in **Settings → Pages → Source → GitHub Actions**.

## Tech stack

- [Next.js 16](https://nextjs.org) — framework + static export
- [shadcn/ui](https://ui.shadcn.com) — component library & registry tooling
- [@json-render/react](https://github.com/vercel-labs/json-render) — JSON-driven rendering
- [react-hook-form](https://react-hook-form.com) — form state
- [@dnd-kit](https://dndkit.com) — drag and drop
- [Shiki](https://shiki.style) — syntax highlighting
- [Base UI](https://base-ui.com) — headless primitives (via shadcn)

