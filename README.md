# Form Studio

A [shadcn/ui registry](https://ui.shadcn.com/docs/registry) with a drag-and-drop form builder, a JSON schema renderer, and a ready-to-use block — all installable with a single command.

**[Docs & Registry](https://rumeshudash.github.io/form-studio)** · **[Live Demo](https://rumeshudash.github.io/form-studio/demo-builder)**

---

## Registry items

| Name | Type | Description |
|---|---|---|
| `form-renderer` | component | Renders a JSON schema into a form using `@json-render/react` + `react-hook-form` |
| `form-builder` | component | Drag-and-drop builder that outputs a `FormSchema` |
| `form-builder-with-schema` | block | Full-page block: builder + live schema panel (copyable) + form preview |

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

const schema = {
  title: "Contact",
  type: "Stack",
  props: { gap: "md" },
  children: [
    { type: "TextInput", props: { label: "Name", name: "name" } },
    { type: "Button", props: { label: "Submit" }, on: { press: "submit" } },
  ],
}

export default function Page() {
  return (
    <FormRenderer
      schema={schema}
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
      catalog={myFieldDefs}        // your FormFieldDefinition[]
      onChange={(schema: FormSchema) => console.log(schema)}
      className="h-screen"
    />
  )
}
```

### Block

The block installs directly as a Next.js page at `app/form-builder/page.tsx`. Edit `custom-fields.tsx` alongside it to add or remove field types.

## Custom fields

Define your own field components and register them with both the builder and renderer:

```tsx
// my-field.tsx
import type { FieldComponent, FormFieldDefinition } from "@/components/form-renderer/types"
import { Star } from "lucide-react"

export const RatingInput: FieldComponent = ({ label, value, onChange }) => (
  // ... your component
)

export const ratingDef: FormFieldDefinition = {
  fieldType: "RatingInput",
  displayName: "Star Rating",
  icon: Star,
  category: "Input",
  defaultProps: { label: "Rating", value: null, max: 5 },
  defaultValue: 0,
  configurableProps: [
    { key: "label", label: "Label", inputType: "text" },
    { key: "max",   label: "Max Stars", inputType: "number" },
  ],
}
```

```tsx
// Pass to both components
<FormBuilder catalog={[ratingDef]} onChange={setSchema} />
<FormRenderer schema={schema} customFields={{ RatingInput }} onSubmit={...} />
```

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
- [@json-render/react](https://github.com/json-render/json-render) — JSON-driven rendering
- [react-hook-form](https://react-hook-form.com) — form state
- [@dnd-kit](https://dndkit.com) — drag and drop
- [Shiki](https://shiki.style) — syntax highlighting
- [Base UI](https://base-ui.com) — headless primitives (via shadcn)
