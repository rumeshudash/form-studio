"use client";

import { Check, Copy } from "lucide-react";
import { useCallback, useState } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { cn } from "@/lib/utils";
import { FormBuilder } from "@/registry/form-builder";
import { FormRenderer } from "@/registry/form-renderer";
import type { FormSchema } from "@/registry/form-renderer/types";
import { CUSTOM_COMPONENTS, CUSTOM_FIELD_DEFS } from "./custom-fields";
import { SchemaViewer } from "./schema-viewer";

type RightTab = "schema" | "preview";

export default function FormBuilderWithSchemaPage() {
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [activeTab, setActiveTab] = useState<RightTab>("schema");
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!schema) return;
    await navigator.clipboard.writeText(JSON.stringify(schema, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [schema]);

  return (
    <ResizablePanelGroup orientation="horizontal" className="flex-1">
      <ResizablePanel defaultSize={70} minSize="55%" className="h-full">
        <FormBuilder className="h-full" catalog={CUSTOM_FIELD_DEFS} onChange={setSchema} />
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel defaultSize={30} minSize="20%" className="h-full">
        <div className="flex flex-col h-full bg-background">
          {/* Panel header */}
          <div className="flex items-center border-b border-border h-10 px-1 gap-0.5 shrink-0">
            {(["schema", "preview"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-3 h-8 text-xs font-medium rounded-sm capitalize transition-colors",
                  activeTab === tab
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                {tab === "schema" ? "Schema" : "Preview"}
              </button>
            ))}

            {activeTab === "schema" && (
              <button
                type="button"
                onClick={handleCopy}
                disabled={!schema}
                title={copied ? "Copied!" : "Copy schema JSON"}
                className={cn(
                  "ml-auto flex items-center gap-1.5 px-2.5 h-7 text-xs rounded-sm border transition-colors",
                  copied
                    ? "text-green-600 border-green-300 bg-green-50 dark:bg-green-950/20"
                    : "border-border text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-40 disabled:pointer-events-none"
                )}
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied" : "Copy"}
              </button>
            )}

            <div className={cn("flex items-center", activeTab !== "schema" && "ml-auto")}>
              <ModeToggle />
            </div>
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-auto">
            {activeTab === "schema" ? (
              <SchemaViewer code={schema ? JSON.stringify(schema, null, 2) : null} />
            ) : (
              <div className="p-6">
                {schema ? (
                  <FormRenderer
                    schema={schema}
                    customFields={CUSTOM_COMPONENTS}
                    onSubmit={(data) => console.log("Form submitted:", data)}
                  />
                ) : (
                  <p className="text-center text-sm text-muted-foreground/60 italic mt-12">
                    Add fields to preview the form…
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
