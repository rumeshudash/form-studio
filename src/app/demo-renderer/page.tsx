"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { FormRenderer } from "@/registry/form-renderer";
import type { FormSchema } from "@/registry/form-renderer/types";

const SAMPLE_SCHEMA: FormSchema = {
  // title: "Contact Form",
  root: "root",
  elements: {
    root: {
      type: "Stack",
      props: { direction: "vertical", gap: "md" },
      children: ["name", "email", "role", "message", "submit"],
    },
    name: {
      type: "Input",
      props: {
        label: "Full Name",
        name: "name",
        type: "text",
        placeholder: "John Doe",
        value: { $bindState: "/name" },
        checks: [{ type: "required", message: "Name is required" }],
        validateOn: "blur",
      },
    },
    email: {
      type: "Input",
      props: {
        label: "Email",
        name: "email",
        type: "email",
        placeholder: "john@example.com",
        value: { $bindState: "/email" },
        checks: [{ type: "required", message: "Email is required" }],
        validateOn: "blur",
      },
    },
    role: {
      type: "Select",
      props: {
        label: "Role",
        name: "role",
        options: ["Developer", "Designer", "Manager", "Other"],
        placeholder: "Select your role...",
        value: { $bindState: "/role" },
        checks: null,
        validateOn: "blur",
      },
    },
    message: {
      type: "Textarea",
      props: {
        label: "Message",
        name: "message",
        placeholder: "Your message...",
        value: { $bindState: "/message" },
        checks: null,
        validateOn: "blur",
      },
    },
    submit: {
      type: "Button",
      props: { label: "Submit", variant: "primary" },
      on: { press: { action: "submit" } },
    },
  },
  state: { name: "", email: "", role: "", message: "" },
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
          onSubmit={(data) => {
            console.log("Submitted:", data);
            alert(JSON.stringify(data, null, 2));
          }}
        />
      </div>
    </main>
  );
}
