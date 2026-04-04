"use client";

import { defineCatalog } from "@json-render/core";
import {
  ActionProvider,
  defineRegistry,
  Renderer,
  StateProvider,
  useBoundProp,
  ValidationProvider,
  VisibilityProvider,
} from "@json-render/react";
import { schema } from "@json-render/react/schema";
import { createElement, useMemo } from "react";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { STRUCTURAL_COMPONENTS } from "../shared/built-in-structural";
import type { FieldComponent, FormSchema } from "./types";
import { useRhfStateStore } from "./use-rhf-state-store";

// ─── Structural catalog entries ───────────────────────────────────────────────

const STRUCTURAL_CATALOG_ENTRIES = Object.fromEntries(
  Object.keys(STRUCTURAL_COMPONENTS).map((key) => [
    key,
    { props: z.record(z.string(), z.unknown()), description: key, slots: ["default"] },
  ])
) as Record<string, { props: ReturnType<typeof z.record>; description: string; slots: string[] }>;

// ─── FieldComponent wrapper ───────────────────────────────────────────────────

function wrapFieldComponent(Component: FieldComponent) {
  return function FieldWrapper({
    props,
    bindings,
  }: {
    props: Record<string, unknown>;
    bindings?: Record<string, string>;
  }) {
    const [value, setValue] = useBoundProp(props.value, bindings?.value);
    return createElement(Component, { ...props, value, onChange: setValue });
  };
}

// ─── Registry factory ─────────────────────────────────────────────────────────

function createFieldRegistry(customFields: Record<string, FieldComponent> = {}) {
  const fieldCatalogEntries = Object.fromEntries(
    Object.keys(customFields).map((key) => [
      key,
      { props: z.record(z.string(), z.unknown()), description: key },
    ])
  ) as Record<string, { props: ReturnType<typeof z.record>; description: string }>;

  const catalog = defineCatalog(schema, {
    components: {
      ...STRUCTURAL_CATALOG_ENTRIES,
      ...fieldCatalogEntries,
    } as any,
    actions: {},
  });

  const wrappedCustom = Object.fromEntries(
    Object.entries(customFields).map(([key, Component]) => [key, wrapFieldComponent(Component)])
  );

  const { registry } = defineRegistry(catalog, {
    components: {
      ...STRUCTURAL_COMPONENTS,
      ...wrappedCustom,
    } as any,
  });

  return registry;
}

// ─── FormRenderer ─────────────────────────────────────────────────────────────

export interface FormRendererProps {
  schema: FormSchema;
  onSubmit: (data: Record<string, unknown>) => void | Promise<void>;
  defaultValues?: Record<string, unknown>;
  /** Plain React field components (FieldComponent interface). Auto-wrapped with state binding. */
  customFields?: Record<string, FieldComponent>;
  className?: string;
}

export function FormRenderer({
  schema,
  onSubmit,
  defaultValues,
  customFields,
  className,
}: FormRendererProps) {
  const initialValues = { ...schema.state, ...defaultValues };
  const { store, form } = useRhfStateStore(initialValues);

  const registry = useMemo(
    () => createFieldRegistry(customFields),
    // biome-ignore lint/correctness/useExhaustiveDependencies: registry is intentionally created once; customFields changes are not supported at runtime
    []
  );

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data);
  });

  return (
    <StateProvider store={store}>
      <ActionProvider
        handlers={{
          submit: async () => {
            await handleSubmit();
          },
        }}
      >
        <VisibilityProvider>
          <ValidationProvider>
            <form
              onSubmit={(e) => e.preventDefault()}
              className={cn("w-full", className)}
              noValidate
            >
              <Renderer spec={schema} registry={registry} />
            </form>
          </ValidationProvider>
        </VisibilityProvider>
      </ActionProvider>
    </StateProvider>
  );
}
