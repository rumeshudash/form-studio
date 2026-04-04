import { Blocks, Component, ExternalLink, GitFork, Package } from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { ModeToggle } from "@/components/mode-toggle";

const REGISTRY_URL =
  process.env.NEXT_PUBLIC_REGISTRY_URL || "https://your-username.github.io/your-repo/r";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

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
      "Drag-and-drop visual form builder that outputs a json-render compatible FormSchema. Includes a field palette, canvas with grid support, and a configurable properties panel.",
    dependencies: [
      "@dnd-kit/core",
      "@dnd-kit/sortable",
      "@dnd-kit/utilities",
      "@json-render/react",
      "react-hook-form",
      "zod",
    ],
    registryDeps: ["form-renderer"],
  },
];

const BLOCKS = [
  {
    name: "form-builder-with-schema",
    title: "Form Builder with Schema & Preview",
    description:
      "A full-page block that combines the drag-and-drop builder with a resizable side panel showing the live JSON schema (copyable) and a form preview — ready to drop into any Next.js app route.",
    dependencies: ["shiki", "react-resizable-panels"],
    registryDeps: [
      "form-builder",
      "resizable",
      "input",
      "textarea",
      "select",
      "checkbox",
      "radio-group",
      "switch",
      "slider",
    ],
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function InstallCommand({ url }: { url: string }) {
  const cmd = `npx shadcn@latest add "${url}"`;
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 font-mono text-xs text-foreground/80">
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
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <h3 className="text-base font-semibold">{item.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
      </div>

      <InstallCommand url={`${REGISTRY_URL}/${item.name}.json`} />

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

export default function DocsPage() {
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
              <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs text-foreground/80">
                <span className="flex-1">npx shadcn@latest init</span>
                <CopyButton value="npx shadcn@latest init" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-medium">2. Add any component from the registry</p>
              <InstallCommand url={`${REGISTRY_URL}/form-builder.json`} />
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-medium">3. Use it in your app</p>
              <div className="rounded-lg border border-border bg-background p-3 font-mono text-xs text-foreground/80 leading-relaxed whitespace-pre">{`import { FormBuilder } from "@/components/form-builder"

export default function Page() {
  return (
    <FormBuilder
      catalog={myFieldDefs}
      onChange={(schema) => console.log(schema)}
    />
  )
}`}</div>
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
            The form builder outputs a{" "}
            <a
              href="https://github.com/vercel-labs/json-render"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-foreground transition-colors"
            >
              @json-render
            </a>{" "}
            compatible{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">FormSchema</code>.
            Pass it directly to{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">FormRenderer</code>{" "}
            to render the form.
          </p>
          <div className="rounded-xl border border-border bg-muted/30 p-4 font-mono text-xs text-foreground/80 leading-relaxed overflow-x-auto">
            <pre>{`{
  "title": "Contact Form",
  "type": "Stack",
  "props": { "gap": "md" },
  "children": [
    {
      "type": "TextInput",
      "props": { "label": "Name", "name": "name" },
      "state": { "value": "$bindState:name" }
    },
    {
      "type": "Button",
      "props": { "label": "Submit" },
      "on": { "press": "submit" }
    }
  ]
}`}</pre>
          </div>
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
