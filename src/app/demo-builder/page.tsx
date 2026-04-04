"use client";

import { useState } from "react";
import { FormBuilder } from "@/registry/form-builder";
import { FormRenderer } from "@/registry/form-renderer";
import { CUSTOM_COMPONENTS, CUSTOM_FIELD_DEFS } from "./custom-fields";
import type { FormSchema } from "@/registry/form-renderer/types";

export default function BuilderDemoPage() {
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-background shrink-0">
        <h1 className="text-base font-semibold">Form Builder Demo</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreviewMode((v) => !v)}
            disabled={previewMode && !schema}
            className="px-3 py-1.5 rounded-md text-sm border border-border bg-background hover:bg-accent transition-colors disabled:opacity-50"
          >
            {previewMode ? "Back to Builder" : "Preview Form"}
          </button>
        </div>
      </header>

      {previewMode && schema ? (
        <main className="flex-1 overflow-y-auto bg-muted/20 flex items-center justify-center p-8">
          <div className="w-full max-w-lg bg-background rounded-xl border border-border p-8 shadow-sm">
            <h2 className="text-xl font-semibold mb-6">{schema.title || "Preview"}</h2>
            <FormRenderer
              schema={schema}
              customFields={{ ...CUSTOM_COMPONENTS }}
              onSubmit={(data) => {
                console.log("Form submitted:", data);
                alert(JSON.stringify(data, null, 2));
              }}
            />
          </div>
        </main>
      ) : (
        <FormBuilder
          className="flex-1"
          catalog={CUSTOM_FIELD_DEFS}
          defaultSchema={schema || undefined}
          onChange={setSchema}
        />
      )}
    </div>
  );
}
