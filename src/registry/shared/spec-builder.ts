import type {
  FormBuilderState,
  FormSchema,
  CanvasField,
  CanvasGrid,
  CanvasItem,
  FormFieldDefinition,
  StackConfig,
  ButtonConfig,
} from "../form-renderer/types";

export const DEFAULT_STACK_CONFIG: StackConfig = { gap: "md" };
export const DEFAULT_BUTTON_CONFIG: ButtonConfig = { label: "Submit", variant: "primary", disabled: false };

function getDefaultValue(field: CanvasField, def?: FormFieldDefinition): unknown {
  if (def?.defaultValue !== undefined) return def.defaultValue;
  if (field.fieldType === "Checkbox" || field.fieldType === "Switch") return false;
  if (field.fieldType === "Slider") return (field.props.min as number) ?? 0;
  return "";
}

function getBoundProp(fieldType: string, def?: FormFieldDefinition): string {
  if (def?.boundProp) return def.boundProp;
  if (fieldType === "Checkbox" || fieldType === "Switch") return "checked";
  return "value";
}

function buildFieldElement(
  field: CanvasField,
  catalogMap: Record<string, FormFieldDefinition>
): object {
  const def = catalogMap[field.fieldType];
  if (def?.isStructural) {
    return { type: field.fieldType, props: { ...field.props } };
  }
  const bindProp = getBoundProp(field.fieldType, def);
  return {
    type: field.fieldType,
    props: {
      ...field.props,
      [bindProp]: { $bindState: `/${field.props.name as string}` },
    },
  };
}

function makeCanvasField(
  elementKey: string,
  el: { type: string; props?: Record<string, unknown> },
  def?: FormFieldDefinition
): CanvasField {
  if (def?.isStructural) {
    return { kind: "field", id: crypto.randomUUID(), elementKey, fieldType: el.type, props: { ...(el.props ?? {}) } };
  }
  const bindProp = getBoundProp(el.type, def);
  return {
    kind: "field",
    id: crypto.randomUUID(),
    elementKey,
    fieldType: el.type,
    props: { ...(el.props ?? {}), [bindProp]: null },
  };
}

// ─── buildBuilderStateFromSpec ────────────────────────────────────────────────

export function buildBuilderStateFromSpec(
  schema: Partial<FormSchema>,
  validFieldTypes: Set<string>,
  catalogMap: Record<string, FormFieldDefinition> = {}
): Partial<FormBuilderState> {
  const rootElement = schema.elements?.["root"];
  const rootChildren = (rootElement?.children ?? []).filter((k) => k !== "__submit__");

  const items: CanvasItem[] = [];

  for (const key of rootChildren) {
    const el = schema.elements?.[key];
    if (!el) continue;

    if (el.type === "Grid") {
      const cols = ((el.props?.columns as number) ?? 2) as 2 | 3;
      const fields: CanvasField[] = [];
      for (const childKey of el.children ?? []) {
        const childEl = schema.elements?.[childKey];
        if (childEl && validFieldTypes.has(childEl.type)) {
          fields.push(makeCanvasField(childKey, { type: childEl.type, props: childEl.props as Record<string, unknown> }, catalogMap[childEl.type]));
        }
      }
      items.push({ kind: "grid", id: crypto.randomUUID(), elementKey: key, columns: cols, fields });
    } else if (validFieldTypes.has(el.type)) {
      items.push(makeCanvasField(key, { type: el.type, props: el.props as Record<string, unknown> }, catalogMap[el.type]));
    }
  }

  const rootEl = schema.elements?.["root"];
  const submitEl = schema.elements?.["__submit__"];

  const stackConfig: StackConfig = {
    gap: (rootEl?.props?.gap as StackConfig["gap"]) ?? DEFAULT_STACK_CONFIG.gap,
    // align: (rootEl?.props?.align as StackConfig["align"]) ?? DEFAULT_STACK_CONFIG.align,
    // justify: (rootEl?.props?.justify as StackConfig["justify"]) ?? DEFAULT_STACK_CONFIG.justify,
  };

  const buttonConfig: ButtonConfig = {
    label: (submitEl?.props?.label as string) ?? DEFAULT_BUTTON_CONFIG.label,
    variant: (submitEl?.props?.variant as ButtonConfig["variant"]) ?? DEFAULT_BUTTON_CONFIG.variant,
    disabled: (submitEl?.props?.disabled as boolean) ?? DEFAULT_BUTTON_CONFIG.disabled,
  };

  return {
    items,
    formTitle: schema.title ?? "My Form",
    formDescription: schema.description ?? "",
    selectedFieldId: null,
    stackConfig,
    buttonConfig,
  };
}

// ─── buildSpecFromBuilderState ────────────────────────────────────────────────

export function buildSpecFromBuilderState(
  state: FormBuilderState,
  catalogMap: Record<string, FormFieldDefinition> = {}
): FormSchema {
  const rootChildren: string[] = [];
  const elements: Record<string, object> = {};

  for (const item of state.items) {
    if (item.kind === "grid") {
      const grid = item as CanvasGrid;
      elements[grid.elementKey] = {
        type: "Grid",
        props: { columns: grid.columns, gap: "md" },
        children: grid.fields.map((f) => f.elementKey),
      };
      rootChildren.push(grid.elementKey);
      for (const field of grid.fields) {
        elements[field.elementKey] = buildFieldElement(field, catalogMap);
      }
    } else {
      const field = item as CanvasField;
      elements[field.elementKey] = buildFieldElement(field, catalogMap);
      rootChildren.push(field.elementKey);
    }
  }

  const allFields = state.items.flatMap((item): CanvasField[] =>
    item.kind === "grid" ? item.fields : [item as CanvasField]
  );

  const stateDefaults = Object.fromEntries(
    allFields
      .filter((f) => !catalogMap[f.fieldType]?.isStructural)
      .map((f) => [f.props.name as string, getDefaultValue(f, catalogMap[f.fieldType])])
  );

  const sc = state.stackConfig ?? DEFAULT_STACK_CONFIG;
  const bc = state.buttonConfig ?? DEFAULT_BUTTON_CONFIG;

  return {
    title: state.formTitle,
    description: state.formDescription,
    root: "root",
    elements: {
      root: { type: "Stack", props: { direction: "vertical", gap: sc.gap, align: sc.align, justify: sc.justify }, children: [...rootChildren, "__submit__"] },
      __submit__: { type: "Button", props: { label: bc.label, variant: bc.variant, disabled: bc.disabled }, on: { press: { action: "submit" } } },
      ...elements,
    },
    state: stateDefaults,
  };
}
