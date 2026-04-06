import { Blocks, Component, ExternalLink, GitFork, Package } from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { ModeToggle } from "@/components/mode-toggle";
import { cn } from "@/lib/utils";

const REGISTRY_URL =
  process.env.NEXT_PUBLIC_REGISTRY_URL || "https://your-username.github.io/your-repo/r";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

// ─── Quick-start code snippets ────────────────────────────────────────────────

const SNIPPET_CATALOG = `import { TextCursorInput } from "lucide-react"
import type { FieldComponent, FormFieldEntry } from "@/components/form-renderer/types"

const TextInput: FieldComponent = ({ label, value, onChange, onBlur, errors }) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-sm font-medium">{String(label)}</label>}
    <input
      value={String(value ?? "")}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      className="border rounded px-3 py-1.5 text-sm"
    />
    {errors?.[0] && <p className="text-xs text-red-500">{errors[0]}</p>}
  </div>
)

export const catalog: FormFieldEntry[] = [
  {
    fieldType: "TextInput",
    displayName: "Text Input",
    icon: TextCursorInput,
    category: "Input",
    defaultProps: { label: "Label", placeholder: "" },
    defaultValue: "",
    configurableProps: [
      { key: "label",       label: "Label",       inputType: "text" },
      { key: "name",        label: "Field Name",  inputType: "text" },
      { key: "placeholder", label: "Placeholder", inputType: "text" },
    ],
    component: TextInput,
  },
]`;

const SNIPPET_RENDERER = `import { FormRenderer } from "@/components/form-renderer"
import { catalog } from "./catalog"

const schema = {
  fields: [
    { type: "TextInput", name: "name",  props: { label: "Name" },
      validation: [{ type: "required" }] },
    { type: "TextInput", name: "email", props: { label: "Email" },
      validation: [{ type: "required" }] },
  ],
  submit: { label: "Send" },
}

export default function Page() {
  return (
    <FormRenderer
      schema={schema}
      catalog={catalog}
      onSubmit={(data) => console.log(data)}
    />
  )
}`;

const SNIPPET_BUILDER = `import { FormBuilder } from "@/components/form-builder"
import { catalog } from "./catalog"

export default function Page() {
  return (
    <FormBuilder
      catalog={catalog}
      onChange={(schema) => console.log(schema)}
    />
  )
}`;

const SNIPPET_SCHEMA = `{
  "title": "Contact Form",
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
      "props": { "label": "Email", "type": "email" },
      "validation": [{ "type": "required" }]
    },
    {
      "type": "SelectField",
      "name": "subject",
      "props": { "label": "Subject", "options": ["Support", "Billing", "Other"] },
      "conditions": [{ "triggerField": "email", "operator": "truthy", "action": "show" }]
    }
  ],
  "submit": { "label": "Send Message" }
}`;

// ─── Registry data ────────────────────────────────────────────────────────────

const COMPONENTS = [
  {
    name: "form-renderer",
    title: "Form Renderer",
    description:
      "Renders a JSON schema into a fully functional form using @json-render/react with react-hook-form state management. Supports custom field components, structural layout elements, and a submit handler.",
    dependencies: ["@json-render/react", "@json-render/core", "react-hook-form", "zod"],
    registryDeps: ["button"],
  },
  {
    name: "form-builder",
    title: "Form Builder",
    description:
      "Drag-and-drop visual form builder that outputs a FormSchema. Includes a field palette, canvas with grid support, and a configurable properties panel for validation and conditional logic.",
    dependencies: [
      "@json-render/react",
      "@json-render/core",
      "react-hook-form",
      "zod",
      "@dnd-kit/core",
      "@dnd-kit/sortable",
      "@dnd-kit/utilities",
    ],
    registryDeps: ["form-renderer", "button", "checkbox", "input", "label", "select", "textarea"],
  },
];

const BLOCKS = [
  {
    name: "form-builder-with-schema",
    title: "Form Builder with Schema & Preview",
    description:
      "A full-page block that combines the drag-and-drop builder with a live JSON schema panel (copyable) and a form preview — ready to drop into any Next.js app route.",
    dependencies: ["shiki"],
    registryDeps: [
      "form-builder",
      "button",
      "dialog",
      "tabs",
      "input",
      "textarea",
      "label",
      "select",
      "checkbox",
      "radio-group",
      "switch",
      "slider",
    ],
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

async function highlight(code: string, lang: "tsx" | "json"): Promise<string> {
  const { getSingletonHighlighter } = await import("shiki");
  const hl = await getSingletonHighlighter({
    langs: ["tsx", "json"],
    themes: ["github-light", "github-dark"],
  });
  return hl.codeToHtml(code, {
    lang,
    themes: { light: "github-light", dark: "github-dark" },
  });
}

function CodeBlock({ html, code }: { html: string; code: string }) {
  return (
    <div className="relative rounded-lg border border-border bg-background overflow-hidden">
      <div className="absolute right-2 top-2 z-10">
        <CopyButton value={code} />
      </div>
      <div
        className="code-block overflow-x-auto p-3 pr-10"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

function CommandBlock({ cmd, className }: { cmd: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs text-foreground/80",
        className
      )}
    >
      <span className="select-all flex-1 overflow-x-auto whitespace-nowrap">{cmd}</span>
      <CopyButton value={cmd} />
    </div>
  );
}

function DepBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground font-mono">
      {label}
    </span>
  );
}

function ComponentCard({ item }: { item: (typeof COMPONENTS)[number] | (typeof BLOCKS)[number] }) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-5 flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <h3 className="text-base font-semibold">{item.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
      </div>

      <CommandBlock
        cmd={`npx shadcn@latest add "${REGISTRY_URL}/${item.name}.json"`}
        className=""
      />

      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Dependencies
        </p>
        <div className="flex flex-wrap gap-1.5">
          {item.dependencies.map((dep) => (
            <DepBadge key={dep} label={dep} />
          ))}
          {item.registryDeps.map((dep) => (
            <DepBadge key={dep} label={dep} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DocsPage() {
  const [catalogHtml, rendererHtml, builderHtml, schemaHtml] = await Promise.all([
    highlight(SNIPPET_CATALOG, "tsx"),
    highlight(SNIPPET_RENDERER, "tsx"),
    highlight(SNIPPET_BUILDER, "tsx"),
    highlight(SNIPPET_SCHEMA, "json"),
  ]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <Blocks className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold">Form Studio</span>
          </div>
          <nav className="flex items-center gap-3">
            <a
              href={`${BASE_PATH}/demo-builder`}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Demo
            </a>
            <a
              href="https://github.com/rumeshudash/form-studio"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mr-2"
            >
              <GitFork className="h-3.5 w-3.5" />
              GitHub
            </a>
            <ModeToggle />
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-16 flex flex-col gap-20">
        {/* Hero */}
        <section className="flex flex-col gap-6 max-w-2xl">
          <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
            <Package className="h-3 w-3" />
            shadcn/ui registry
          </div>
          <h1 className="text-4xl font-bold tracking-tight leading-tight">
            Build dynamic forms,
            <br />
            faster.
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Form Studio is a{" "}
            <a
              href="https://ui.shadcn.com/docs/registry"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-foreground transition-colors"
            >
              shadcn/ui registry
            </a>{" "}
            with a drag-and-drop form builder, a JSON schema renderer, and a ready-to-use block —
            all installable with a single command.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href={`${BASE_PATH}/demo-builder`}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Try the demo
            </a>
            <a
              href="https://github.com/rumeshudash/form-studio"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
            >
              <GitFork className="h-4 w-4" />
              View on GitHub
            </a>
          </div>
        </section>

        {/* Quick start */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-2xl font-semibold">Quick start</h2>
            <p className="text-muted-foreground">
              Make sure you have a Next.js project with{" "}
              <a
                href="https://ui.shadcn.com/docs/installation"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-foreground transition-colors"
              >
                shadcn/ui
              </a>{" "}
              initialized, then install any registry item directly.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-muted/30 p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-medium">
                1. Initialize shadcn/ui (if you haven&apos;t already)
              </p>
              <CommandBlock cmd="npx shadcn@latest init" />
            </div>

            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-medium">2. Install the renderer</p>
              <CommandBlock cmd={`npx shadcn@latest add "${REGISTRY_URL}/form-renderer.json"`} />
            </div>

            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-medium">3. Define your field catalog</p>
              <p className="text-xs text-muted-foreground">
                A catalog maps field type keys to React components and their metadata. Pass the same
                array to both <code className="rounded bg-muted px-1 py-0.5">FormRenderer</code> and{" "}
                <code className="rounded bg-muted px-1 py-0.5">FormBuilder</code>.
              </p>
              <CodeBlock html={catalogHtml} code={SNIPPET_CATALOG} />
            </div>

            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-medium">4. Render a form from a schema</p>
              <CodeBlock html={rendererHtml} code={SNIPPET_RENDERER} />
            </div>

            <div className="border-t border-border pt-4 flex flex-col gap-1.5">
              <p className="text-sm font-medium">
                Want a visual builder instead? Install{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs">form-builder</code>
              </p>
              <CommandBlock cmd={`npx shadcn@latest add "${REGISTRY_URL}/form-builder.json"`} />
              <CodeBlock html={builderHtml} code={SNIPPET_BUILDER} />
            </div>
          </div>
        </section>

        {/* Components */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <Component className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-2xl font-semibold">Components</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {COMPONENTS.map((item) => (
              <ComponentCard key={item.name} item={item} />
            ))}
          </div>
        </section>

        {/* Blocks */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <Blocks className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-2xl font-semibold">Blocks</h2>
          </div>
          <p className="text-muted-foreground -mt-2">
            Drop-in page components. Install directly into your{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">app/</code> directory
            and customize from there.
          </p>
          <div className="flex flex-col gap-4">
            {BLOCKS.map((item) => (
              <ComponentCard key={item.name} item={item} />
            ))}
          </div>
        </section>

        {/* Schema format */}
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-semibold">Schema format</h2>
          <p className="text-muted-foreground">
            The form builder outputs a plain{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">FormSchema</code>{" "}
            object. Pass it directly to{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">FormRenderer</code>{" "}
            to render the form. Fields reference types from your own catalog, with optional
            validation rules and conditional logic.
          </p>
          <CodeBlock html={schemaHtml} code={SNIPPET_SCHEMA} />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-8">
        <div className="mx-auto max-w-5xl px-6 py-8 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Built with{" "}
            <a
              href="https://ui.shadcn.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-foreground transition-colors"
            >
              shadcn/ui
            </a>
          </span>
          <a
            href="https://github.com/rumeshudash/form-studio"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <GitFork className="h-4 w-4" />
            rumeshudash/form-studio
          </a>
        </div>
      </footer>
    </div>
  );
}
