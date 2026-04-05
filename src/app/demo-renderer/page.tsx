"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { FormRenderer } from "@/registry/form-renderer";
import type { FormSchema } from "@/registry/form-renderer/types";
import { CUSTOM_COMPONENTS } from "../blocks/form-builder-with-schema/custom-fields";

const SAMPLE_SCHEMA: FormSchema = {
  title: "Contact Form",
  fields: [
    { type: "TextInput", name: "name", props: { label: "Full Name", placeholder: "John Doe" } },
    { type: "TextInput", name: "email", props: { label: "Email", placeholder: "john@example.com", type: "email" } },
    {
      type: "SelectField",
      name: "role",
      props: { label: "Role", options: ["Developer", "Designer", "Manager", "Other"], placeholder: "Select your role..." },
    },
    { type: "Textarea", name: "message", props: { label: "Message", placeholder: "Your message..." } },
  ],
  submit: { label: "Submit" },
};

export default function RendererDemoPage() {
  return (
    <main className="min-h-screen bg-muted/20 flex flex-col items-center justify-center p-8 relative">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      <div className="w-full max-w-lg bg-background rounded-xl border border-border p-8 shadow-sm">
        <h1 className="text-2xl font-semibold mb-1">Form Renderer Demo</h1>
        <p className="text-sm text-muted-foreground mb-8">
          A hardcoded schema rendered via{" "}
          <code className="text-xs bg-muted px-1 py-0.5 rounded">FormRenderer</code>
        </p>
        <FormRenderer
          schema={SAMPLE_SCHEMA}
          customFields={CUSTOM_COMPONENTS}
          onSubmit={(data) => {
            console.log("Submitted:", data);
            alert(JSON.stringify(data, null, 2));
          }}
        />
      </div>
    </main>
  );
}
