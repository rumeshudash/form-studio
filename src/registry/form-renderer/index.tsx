"use client";

import type { StateCondition, VisibilityCondition } from "@json-render/core";
import { defineCatalog } from "@json-render/core";
import type { Spec, StateModel, StateStore } from "@json-render/react";
import {
  ActionProvider,
  defineRegistry,
  Renderer,
  StateProvider,
  useBoundProp,
  VisibilityProvider,
} from "@json-render/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { schema } from "@json-render/react/schema";
import { Button as ShadcnButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  FieldComponent,
  FieldCondition,
  FieldValidationRule,
  FormField,
  FormRow,
  FormSchema,
  ValidationRuleType,
} from "./types";

import { createElement, useMemo, useRef } from "react";

// ─── useRhfStateStore ─────────────────────────────────────────────────────────────────

function getByJsonPointer(obj: Record<string, unknown>, path: string): unknown {
  if (!path || path === "/") return obj;
  const parts = path.replace(/^\//, "").split("/");
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

function setByJsonPointer(
  obj: Record<string, unknown>,
  path: string,
  value: unknown
): Record<string, unknown> {
  if (!path || path === "/") return obj;
  const parts = path.replace(/^\//, "").split("/");
  const next = { ...obj };
  let current: Record<string, unknown> = next;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    current[part!] = { ...(current[part!] as Record<string, unknown>) };
    current = current[part!] as Record<string, unknown>;
  }
  current[parts[parts.length - 1]!] = value;
  return next;
}

function useRhfStateStore(
  defaultValues: Record<string, unknown> = {},
  zodSchema?: z.ZodObject<Record<string, z.ZodTypeAny>>
) {
  const form = useForm<Record<string, unknown>>({
    defaultValues,
    mode: "onBlur",
    ...(zodSchema && { resolver: zodResolver(zodSchema) }),
  });

  const listenersRef = useRef(new Set<() => void>());
  const snapshotRef = useRef<StateModel>({ ...defaultValues });

  form.watch((values) => {
    snapshotRef.current = values as StateModel;
    listenersRef.current.forEach((l) => {
      l();
    });
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: store is created once on mount; initialValues changes are intentionally ignored
  const store = useMemo<StateStore>(
    () => ({
      get: (path) => getByJsonPointer(snapshotRef.current, path),

      set: (path, value) => {
        const key = path.replace(/^\//, "");
        form.setValue(key as never, value as never, { shouldValidate: true, shouldDirty: true });
        snapshotRef.current = setByJsonPointer(snapshotRef.current, path, value);
        listenersRef.current.forEach((l) => {
          l();
        });
      },

      update: (updates) => {
        let next = snapshotRef.current;
        Object.entries(updates).forEach(([path, value]) => {
          const key = path.replace(/^\//, "");
          form.setValue(key as never, value as never, { shouldValidate: true, shouldDirty: true });
          next = setByJsonPointer(next, path, value);
        });
        snapshotRef.current = next;
        listenersRef.current.forEach((l) => {
          l();
        });
      },

      getSnapshot: () => snapshotRef.current,

      subscribe: (listener) => {
        listenersRef.current.add(listener);
        return () => listenersRef.current.delete(listener);
      },
    }),
    []
  );

  return { store, form };
}

// ─── Built-in structural components ──────────────────────────────────────────

type StructuralComponent<P extends Record<string, unknown> = Record<string, unknown>> = (args: {
  props: P;
  children?: React.ReactNode;
  emit?: (event: string) => void;
}) => React.ReactElement | null;

const GAP = { none: "gap-0", sm: "gap-2", md: "gap-3", lg: "gap-4", xl: "gap-6" } as const;
const ALIGN = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
} as const;
const JUSTIFY = {
  start: "",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
} as const;

const Stack: StructuralComponent = ({ props, children }) => (
  <div
    className={cn(
      "@container/stack flex",
      props.direction === "horizontal" ? "flex-row flex-wrap" : "flex-col",
      GAP[(props.gap as keyof typeof GAP) ?? "md"] ?? "gap-3",
      ALIGN[props.align as keyof typeof ALIGN] ?? "",
      JUSTIFY[props.justify as keyof typeof JUSTIFY] ?? "",
      props.className as string
    )}
  >
    {children}
  </div>
);

const GRID_COLS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
};
const GRID_GAP = { sm: "gap-2", md: "gap-3", lg: "gap-4", xl: "gap-6" } as const;

const Grid: StructuralComponent = ({ props, children }) => {
  const n = Math.max(1, Math.min(6, (props.columns as number) ?? 1));
  return (
    <div
      className={cn(
        "grid @max-sm/stack:grid-cols-1",
        GRID_COLS[n],
        GRID_GAP[(props.gap as keyof typeof GRID_GAP) ?? "md"] ?? "gap-3",
        props.className as string
      )}
    >
      {children}
    </div>
  );
};

const BTN_VARIANT_MAP: Record<
  string,
  "default" | "secondary" | "destructive" | "outline" | "ghost"
> = {
  primary: "default",
  secondary: "secondary",
  danger: "destructive",
  outline: "outline",
  ghost: "ghost",
};

const Button: StructuralComponent = ({ props, emit }) => (
  <ShadcnButton
    type="submit"
    variant={BTN_VARIANT_MAP[(props.variant as string) ?? "primary"] ?? "default"}
    disabled={(props.disabled as boolean) ?? false}
    onClick={() => emit?.("press")}
    className={props.className as string}
  >
    {(props.label as string) ?? "Submit"}
  </ShadcnButton>
);

const HEADING_CLASS: Record<string, string> = {
  h1: "text-2xl font-bold",
  h2: "text-lg font-semibold",
  h3: "text-base font-semibold",
  h4: "text-sm font-semibold",
};

const Heading: StructuralComponent = ({ props }) => {
  const level = (props.level as string) ?? "h2";
  const Tag = (["h1", "h2", "h3", "h4"].includes(level) ? level : "h2") as
    | "h1"
    | "h2"
    | "h3"
    | "h4";
  return (
    <Tag className={cn(HEADING_CLASS[level] ?? HEADING_CLASS.h2, props.className as string)}>
      {props.text as string}
    </Tag>
  );
};

const TEXT_CLASS: Record<string, string> = {
  default: "text-sm",
  muted: "text-sm text-muted-foreground",
  caption: "text-xs text-muted-foreground",
  lead: "text-xl text-muted-foreground",
  code: "font-mono text-sm bg-muted px-1.5 py-0.5 rounded",
};

const Text: StructuralComponent = ({ props }) => {
  const variant = (props.variant as string) ?? "default";
  if (variant === "code") {
    return (
      <code className={cn(TEXT_CLASS.code, props.className as string)}>{props.text as string}</code>
    );
  }
  return (
    <p className={cn(TEXT_CLASS[variant] ?? TEXT_CLASS.default, props.className as string)}>
      {props.text as string}
    </p>
  );
};

const STRUCTURAL_COMPONENTS = { Stack, Grid, Button, Heading, Text };

// ─── Registry factory ─────────────────────────────────────────────────────────

const STRUCTURAL_CATALOG_ENTRIES = Object.fromEntries(
  Object.keys(STRUCTURAL_COMPONENTS).map((key) => [
    key,
    { props: z.record(z.string(), z.unknown()), description: key, slots: ["default"] },
  ])
) as Record<string, { props: ReturnType<typeof z.record>; description: string; slots: string[] }>;

function wrapFieldComponent(Component: FieldComponent) {
  return function FieldWrapper({
    props,
    bindings,
  }: {
    props: Record<string, unknown>;
    bindings?: Record<string, string>;
  }) {
    const name = props.name as string | undefined;

    // Unnamed structural elements (e.g. decorative fields) — no form registration needed
    if (!name) {
      // biome-ignore lint/correctness/useHookAtTopLevel: fallback path for unnamed fields only
      const [value, setValue] = useBoundProp(props.value, bindings?.value);
      return createElement(Component, {
        ...props,
        value,
        onChange: (v: unknown) => setValue(v),
        errors: [],
        isValid: true,
      });
    }

    return (
      <Controller
        name={name}
        render={({ field, fieldState }) =>
          createElement(Component, {
            ...props,
            value: field.value ?? "",
            onChange: field.onChange,
            onBlur: field.onBlur,
            errors: fieldState.error?.message ? [fieldState.error.message] : [],
            isValid: !fieldState.error,
          })
        }
      />
    );
  };
}

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
    components: { ...STRUCTURAL_COMPONENTS, ...wrappedCustom } as any,
  });

  return registry;
}

// ─── Condition helpers ────────────────────────────────────────────────────────

function conditionToStateCondition(c: FieldCondition): StateCondition {
  const base = { $state: `/${c.triggerField}` };
  switch (c.operator) {
    case "eq":
      return { ...base, eq: c.value };
    case "neq":
      return { ...base, neq: c.value };
    case "gt":
      return { ...base, gt: c.value as number };
    case "gte":
      return { ...base, gte: c.value as number };
    case "lt":
      return { ...base, lt: c.value as number };
    case "lte":
      return { ...base, lte: c.value as number };
    case "truthy":
      return base;
    case "falsy":
      return { ...base, not: true };
  }
}

function buildVisibleCondition(conditions: FieldCondition[]): VisibilityCondition | undefined {
  const showHide = conditions.filter((c) => c.action === "show" || c.action === "hide");
  if (showHide.length === 0) return undefined;
  const stateConditions = showHide.map((c): StateCondition => {
    const sc = conditionToStateCondition(c);
    if (c.action === "hide") {
      // Negate: flip the `not` flag (only `true` is valid, so remove if set)
      if (sc.not) {
        const { not: _, ...rest } = sc;
        return rest as StateCondition;
      }
      return { ...sc, not: true };
    }
    return sc;
  });
  return stateConditions.length === 1 ? stateConditions[0] : { $and: stateConditions };
}

function buildDisabledExpression(conditions: FieldCondition[]): unknown | undefined {
  const ed = conditions.find((c) => c.action === "enable" || c.action === "disable");
  if (!ed) return undefined;
  const sc = conditionToStateCondition(ed);
  return {
    $cond: sc,
    $then: ed.action === "disable",
    $else: ed.action !== "disable",
  };
}

function buildWatchBindings(
  conditions: FieldCondition[],
  targetName: string
): Record<string, object> | undefined {
  const computeConds = conditions.filter((c) => c.action === "compute");
  if (computeConds.length === 0) return undefined;
  const watch: Record<string, object> = {};
  for (const c of computeConds) {
    watch[`/${c.triggerField}`] = {
      action: "setFieldValue",
      params: {
        targetPath: `/${targetName}`,
        sourceExpr: c.computeValue ?? "",
      },
    };
  }
  return watch;
}

const VALIDATION_DEFAULTS: Record<ValidationRuleType, string> = {
  required: "This field is required",
  email: "Enter a valid email address",
  url: "Enter a valid URL",
  numeric: "Must be a number",
  minLength: "Too short",
  maxLength: "Too long",
  min: "Value is too small",
  max: "Value is too large",
  pattern: "Invalid format",
};

function buildZodFieldSchema(
  rules: FieldValidationRule[],
  defaultValue: unknown
): z.ZodTypeAny | null {
  if (!rules.length) return null;

  const isBoolean = typeof defaultValue === "boolean";
  const isNumeric =
    typeof defaultValue === "number" ||
    rules.some((r) => r.type === "min" || r.type === "max" || r.type === "numeric");
  const requiredRule = rules.find((r) => r.type === "required");

  if (isBoolean) {
    const s = z.boolean();
    for (const rule of rules) {
      const msg = rule.message || VALIDATION_DEFAULTS[rule.type];
      if (rule.type === "required") {
        return z.literal(true, {
          message: msg,
        });
      }
    }
    return s;
  }

  if (isNumeric) {
    const numericRule = rules.find((r) => r.type === "numeric");
    let s = z.coerce.number({ error: numericRule?.message || VALIDATION_DEFAULTS.numeric });
    for (const rule of rules) {
      const msg = rule.message || VALIDATION_DEFAULTS[rule.type];
      if (rule.type === "min") s = s.min(rule.value as number, msg);
      if (rule.type === "max") s = s.max(rule.value as number, msg);
    }
    return s;
  }

  let s: z.ZodString | z.ZodEmail | z.ZodURL = z.string();
  for (const rule of rules) {
    const msg = rule.message || VALIDATION_DEFAULTS[rule.type];
    if (rule.type === "email") s = z.email(msg);
    if (rule.type === "url") s = z.url(msg);
    if (rule.type === "minLength") s = s.min(rule.value as number, msg);
    if (rule.type === "maxLength") s = s.max(rule.value as number, msg);
    if (rule.type === "pattern") s = s.regex(new RegExp(rule.value as string), msg);
  }
  if (requiredRule) {
    s = s.min(1, requiredRule.message || VALIDATION_DEFAULTS.required);
  }
  return s;
}

function buildZodFormSchema(
  fields: FormSchema["fields"]
): z.ZodObject<Record<string, z.ZodTypeAny>> | undefined {
  const shape: Record<string, z.ZodTypeAny> = {};
  function collectField(field: FormField) {
    if (!field.name || !field.validation?.length) return;
    const zField = buildZodFieldSchema(field.validation, field.defaultValue ?? "");
    if (zField) shape[field.name] = zField;
  }
  for (const item of fields) {
    if (item.type === "Grid") {
      for (const f of (item as FormRow).fields) collectField(f as FormField);
    } else {
      collectField(item as FormField);
    }
  }
  return Object.keys(shape).length > 0 ? z.object(shape).passthrough() : undefined;
}

// ─── Schema converter ─────────────────────────────────────────────────────────

function schemaToSpec(schema: FormSchema): Spec & { state: Record<string, unknown> } {
  const rootChildren: string[] = [];
  const elements: Record<string, object> = {};
  const stateDefaults: Record<string, unknown> = {};
  let idx = 0;

  function processField(field: FormField): string {
    const key = `f${idx++}`;
    const { type, name, defaultValue, props = {}, conditions = [], validation: _v = [] } = field;

    const visible = buildVisibleCondition(conditions);
    const disabledExpr = buildDisabledExpression(conditions);
    const extraProps = {
      ...(disabledExpr !== undefined && { disabled: disabledExpr }),
    };

    if (!name) {
      elements[key] = {
        type,
        props: { ...props, ...extraProps },
        ...(visible !== undefined && { visible }),
      };
    } else {
      stateDefaults[name] = defaultValue ?? "";
      const watch = buildWatchBindings(conditions, name);
      elements[key] = {
        type,
        props: { ...props, ...extraProps, name, value: { $bindState: `/${name}` } },
        ...(visible !== undefined && { visible }),
        ...(watch && { watch }),
      };
    }
    return key;
  }

  for (const item of schema.fields) {
    if (item.type === "Grid") {
      const row = item as FormRow;
      const gridKey = `g${idx++}`;
      const childKeys = row.fields.map(processField);
      elements[gridKey] = {
        type: "Grid",
        props: { columns: row.columns, gap: row.gap ?? "md" },
        children: childKeys,
      };
      rootChildren.push(gridKey);
    } else {
      rootChildren.push(processField(item as FormField));
    }
  }

  const { gap = "md", align, justify } = schema.layout ?? {};
  const { label = "Submit", variant = "primary", disabled = false } = schema.submit ?? {};

  elements.__submit__ = {
    type: "Button",
    props: { label, variant, disabled },
    on: { press: { action: "submit" } },
  };

  return {
    root: "root",
    elements: {
      root: {
        type: "Stack",
        props: { direction: "vertical", gap, align, justify },
        children: [...rootChildren, "__submit__"],
      },
      ...elements,
    },
    state: stateDefaults,
  } as Spec & { state: Record<string, unknown> };
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
  const spec = schemaToSpec(schema);
  const zodSchema = useMemo(() => buildZodFormSchema(schema.fields), [schema.fields]);
  const initialValues = { ...spec.state, ...defaultValues };
  const { store, form } = useRhfStateStore(initialValues, zodSchema);

  // biome-ignore lint/correctness/useExhaustiveDependencies: registry is intentionally created once; customFields changes are not supported at runtime
  const registry = useMemo(() => createFieldRegistry(customFields), []);

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data);
  });

  return (
    <FormProvider {...form}>
      <StateProvider store={store}>
        <ActionProvider
          handlers={{
            submit: async () => {
              await handleSubmit();
            },
            setFieldValue: (params) => {
              const targetPath = params.targetPath as string;
              const sourceExpr = params.sourceExpr as string;
              const value =
                typeof sourceExpr === "string" && sourceExpr.startsWith("@")
                  ? store.get(`/${sourceExpr.slice(1)}`)
                  : sourceExpr;
              store.set(targetPath, value);
            },
          }}
        >
          <VisibilityProvider>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
              }}
              className={cn("w-full", className)}
              noValidate
            >
              <Renderer spec={spec} registry={registry} />
            </form>
          </VisibilityProvider>
        </ActionProvider>
      </StateProvider>
    </FormProvider>
  );
}
