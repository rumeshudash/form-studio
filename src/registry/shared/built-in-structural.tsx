"use client";

import { Button as ShadcnButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type StructuralComponent<P extends Record<string, unknown> = Record<string, unknown>> = (args: {
  props: P;
  children?: React.ReactNode;
  emit?: (event: string) => void;
}) => React.ReactElement | null;

// ─── Stack ────────────────────────────────────────────────────────────────────

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

export const Stack: StructuralComponent = ({ props, children }) => (
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

// ─── Grid ─────────────────────────────────────────────────────────────────────

const GRID_COLS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
};
const GRID_GAP = { sm: "gap-2", md: "gap-3", lg: "gap-4", xl: "gap-6" } as const;

export const Grid: StructuralComponent = ({ props, children }) => {
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

// ─── Button ───────────────────────────────────────────────────────────────────

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

export const Button: StructuralComponent = ({ props, emit }) => (
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

// ─── Heading ──────────────────────────────────────────────────────────────────

const HEADING_CLASS: Record<string, string> = {
  h1: "text-2xl font-bold",
  h2: "text-lg font-semibold",
  h3: "text-base font-semibold",
  h4: "text-sm font-semibold",
};

export const Heading: StructuralComponent = ({ props }) => {
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

// ─── Text ─────────────────────────────────────────────────────────────────────

const TEXT_CLASS: Record<string, string> = {
  default: "text-sm",
  muted: "text-sm text-muted-foreground",
  caption: "text-xs text-muted-foreground",
  lead: "text-xl text-muted-foreground",
  code: "font-mono text-sm bg-muted px-1.5 py-0.5 rounded",
};

export const Text: StructuralComponent = ({ props }) => {
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

// ─── Export map ───────────────────────────────────────────────────────────────

export const STRUCTURAL_COMPONENTS = { Stack, Grid, Button, Heading, Text };
