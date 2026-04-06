"use client";

import { Check, Copy, Eye } from "lucide-react";
import { useCallback, useState } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormBuilder } from "@/registry/form-builder";
import { FormRenderer } from "@/registry/form-renderer";
import type { FormSchema } from "@/registry/form-renderer/types";
import { CUSTOM_CATALOG } from "./custom-fields";
import { SchemaViewer } from "./schema-viewer";

type ModalTab = "preview" | "schema";

export default function FormBuilderWithSchemaPage() {
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [modalTab, setModalTab] = useState<ModalTab>("preview");
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!schema) return;
    await navigator.clipboard.writeText(JSON.stringify(schema, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [schema]);

  function openPreview() {
    setModalTab("preview");
    setPreviewOpen(true);
  }

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <FormBuilder
        catalog={CUSTOM_CATALOG}
        onChange={setSchema}
        actions={
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" onClick={openPreview}>
              <Eye className="h-3.5 w-3.5" />
              Preview
            </Button>
            <ModeToggle />
          </div>
        }
      />

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-2xl h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
          <Tabs
            value={modalTab}
            onValueChange={(v) => setModalTab(v as ModalTab)}
            className="flex flex-col flex-1 min-h-0"
          >
            <DialogHeader className="flex-row items-center gap-3 border-b px-4 py-2 shrink-0">
              <DialogTitle className="text-sm font-medium">Form Preview</DialogTitle>
              <TabsList variant="line" className="h-8">
                <TabsTrigger value="preview" className="text-xs">
                  Preview
                </TabsTrigger>
                <TabsTrigger value="schema" className="text-xs">
                  Schema
                </TabsTrigger>
              </TabsList>
              {modalTab === "schema" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  disabled={!schema}
                  className="ml-auto text-xs mr-6"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              )}
            </DialogHeader>

            <TabsContent value="preview" className="flex-1 overflow-auto p-6 mt-0">
              {schema ? (
                <FormRenderer
                  schema={schema}
                  catalog={CUSTOM_CATALOG}
                  onSubmit={(data) => alert(`Form submitted: \n ${JSON.stringify(data, null, 2)}`)}
                />
              ) : (
                <p className="text-center text-sm text-muted-foreground/60 italic mt-12">
                  Add fields to preview the form…
                </p>
              )}
            </TabsContent>

            <TabsContent value="schema" className="flex-1 overflow-auto mt-0">
              <SchemaViewer code={schema ? JSON.stringify(schema, null, 2) : null} />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
