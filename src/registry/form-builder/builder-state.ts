"use client";

import { useCallback, useMemo, useState } from "react";
import type {
  ButtonConfig,
  CanvasField,
  CanvasGrid,
  CanvasItem,
  FormBuilderState,
  FormField,
  FormFieldDefinition,
  FormItem,
  FormRow,
  FormSchema,
  StackConfig,
} from "../form-renderer/types";
import { BUILT_IN_LAYOUT_MAP } from "./built-in-layout-defs";

function arrayMove<T>(arr: T[], from: number, to: number): T[] {
  const next = [...arr];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item!);
  return next;
}

/** Find which container (root or grid id) holds the field with the given id. */
export function findContainer(items: CanvasItem[], fieldId: string): string {
  for (const item of items) {
    if (item.id === fieldId) return "root";
    if (item.kind === "grid" && item.fields.some((f) => f.id === fieldId)) return item.id;
  }
  return "root";
}

export function useFormBuilderState(
  catalogMap: Record<string, FormFieldDefinition>,
  initial?: Partial<FormBuilderState> | { fromSchema: Partial<FormSchema> }
) {
  const fullCatalogMap = useMemo(() => ({ ...BUILT_IN_LAYOUT_MAP, ...catalogMap }), [catalogMap]);
  const validFieldTypes = new Set(Object.keys(fullCatalogMap));

  const [state, setState] = useState<FormBuilderState>(() => {
    const base =
      initial && "fromSchema" in initial
        ? buildBuilderStateFromSpec(initial.fromSchema, validFieldTypes)
        : (initial as Partial<FormBuilderState> | undefined);
    return {
      items: base?.items ?? [],
      selectedFieldId: null,
      formTitle: base?.formTitle ?? "My Form",
      formDescription: base?.formDescription ?? "",
      stackConfig: base?.stackConfig ?? { ...DEFAULT_STACK_CONFIG },
      buttonConfig: base?.buttonConfig ?? { ...DEFAULT_BUTTON_CONFIG },
    };
  });

  // ─── Add ──────────────────────────────────────────────────────────────────

  const addField = useCallback(
    (fieldType: string, gridId?: string) => {
      const def = fullCatalogMap[fieldType];
      if (!def) return;
      const id = crypto.randomUUID();
      const shortId = id.slice(0, 8);
      const elementKey = `field_${shortId}`;
      const baseProps = { ...def.defaultProps };
      if (!def.isStructural) {
        baseProps.name = `${fieldType.toLowerCase()}_${shortId}`;
      }
      const newField: CanvasField = { kind: "field", id, elementKey, fieldType, props: baseProps };

      setState((prev) => {
        if (gridId) {
          return {
            ...prev,
            items: prev.items.map((item) =>
              item.kind === "grid" && item.id === gridId
                ? { ...item, fields: [...item.fields, newField] }
                : item
            ),
            selectedFieldId: id,
          };
        }
        return { ...prev, items: [...prev.items, newField], selectedFieldId: id };
      });
    },
    [fullCatalogMap]
  );

  const addGrid = useCallback((columns: 2 | 3) => {
    const id = crypto.randomUUID();
    const shortId = id.slice(0, 8);
    const newGrid: CanvasGrid = {
      kind: "grid",
      id,
      elementKey: `grid_${shortId}`,
      columns,
      fields: [],
    };
    setState((prev) => ({ ...prev, items: [...prev.items, newGrid] }));
  }, []);

  // ─── Remove ───────────────────────────────────────────────────────────────

  const removeItem = useCallback((id: string) => {
    setState((prev) => {
      const items = prev.items
        .filter((item) => item.id !== id)
        .map(
          (item): CanvasItem =>
            item.kind === "grid"
              ? { ...item, fields: item.fields.filter((f) => f.id !== id) }
              : item
        );
      return {
        ...prev,
        items,
        selectedFieldId: prev.selectedFieldId === id ? null : prev.selectedFieldId,
      };
    });
  }, []);

  // ─── Reorder / move ───────────────────────────────────────────────────────

  const reorderItems = useCallback((activeId: string, overId: string) => {
    setState((prev) => {
      const from = prev.items.findIndex((i) => i.id === activeId);
      const to = prev.items.findIndex((i) => i.id === overId);
      if (from === -1 || to === -1 || from === to) return prev;
      return { ...prev, items: arrayMove(prev.items, from, to) };
    });
  }, []);

  const reorderFieldsInGrid = useCallback((gridId: string, activeId: string, overId: string) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.map((item): CanvasItem => {
        if (item.kind !== "grid" || item.id !== gridId) return item;
        const from = item.fields.findIndex((f) => f.id === activeId);
        const to = item.fields.findIndex((f) => f.id === overId);
        if (from === -1 || to === -1 || from === to) return item;
        return { ...item, fields: arrayMove(item.fields, from, to) };
      }),
    }));
  }, []);

  const moveField = useCallback(
    (fieldId: string, fromContainer: string, toContainer: string, overId?: string) => {
      setState((prev) => {
        let movedField: CanvasField | undefined;

        let items = prev.items.map((item): CanvasItem => {
          if (fromContainer === "root" && item.kind === "field" && item.id === fieldId) {
            movedField = item;
            return item;
          }
          if (item.kind === "grid" && item.id === fromContainer) {
            const idx = item.fields.findIndex((f) => f.id === fieldId);
            if (idx !== -1) {
              movedField = item.fields[idx];
              return { ...item, fields: item.fields.filter((f) => f.id !== fieldId) };
            }
          }
          return item;
        });

        if (!movedField) return prev;
        if (fromContainer === "root") items = items.filter((item) => item.id !== fieldId);

        if (toContainer === "root") {
          const overIdx = overId ? items.findIndex((i) => i.id === overId) : -1;
          items =
            overIdx !== -1
              ? [...items.slice(0, overIdx), movedField, ...items.slice(overIdx)]
              : [...items, movedField];
        } else {
          items = items.map((item): CanvasItem => {
            if (item.kind !== "grid" || item.id !== toContainer) return item;
            const overIdx = overId ? item.fields.findIndex((f) => f.id === overId) : -1;
            const newFields =
              overIdx !== -1
                ? [...item.fields.slice(0, overIdx), movedField!, ...item.fields.slice(overIdx)]
                : [...item.fields, movedField!];
            return { ...item, fields: newFields };
          });
        }

        return { ...prev, items };
      });
    },
    []
  );

  // ─── Update ───────────────────────────────────────────────────────────────

  const updateFieldProp = useCallback((id: string, propKey: string, value: unknown) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.map((item): CanvasItem => {
        if (item.kind === "field" && item.id === id) {
          return { ...item, props: { ...item.props, [propKey]: value } };
        }
        if (item.kind === "grid") {
          return {
            ...item,
            fields: item.fields.map((f) =>
              f.id === id ? { ...f, props: { ...f.props, [propKey]: value } } : f
            ),
          };
        }
        return item;
      }),
    }));
  }, []);

  const updateGridColumns = useCallback((gridId: string, columns: 2 | 3) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.kind === "grid" && item.id === gridId ? { ...item, columns } : item
      ),
    }));
  }, []);

  const updateStackConfig = useCallback(
    <K extends keyof StackConfig>(key: K, value: StackConfig[K]) => {
      setState((prev) => ({ ...prev, stackConfig: { ...prev.stackConfig, [key]: value } }));
    },
    []
  );

  const updateButtonConfig = useCallback(
    <K extends keyof ButtonConfig>(key: K, value: ButtonConfig[K]) => {
      setState((prev) => ({ ...prev, buttonConfig: { ...prev.buttonConfig, [key]: value } }));
    },
    []
  );

  const selectField = useCallback((id: string | null) => {
    setState((prev) => ({ ...prev, selectedFieldId: id }));
  }, []);

  const setFormMeta = useCallback((key: "formTitle" | "formDescription", value: string) => {
    setState((prev) => ({ ...prev, [key]: value }));
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional subset — fullCatalogMap is stable and excluded to avoid unnecessary rebuilds
  const schema = useMemo(
    () => buildSpecFromBuilderState(state, fullCatalogMap),
    [state.items, state.formTitle, state.formDescription, state.stackConfig, state.buttonConfig]
  );

  return {
    state,
    schema,
    addField,
    addGrid,
    removeItem,
    reorderItems,
    reorderFieldsInGrid,
    moveField,
    updateFieldProp,
    updateGridColumns,
    updateStackConfig,
    updateButtonConfig,
    selectField,
    setFormMeta,
    fullCatalogMap,
  };
}

// ─── Spec builder ─────────────────────────────────────────────────────────────

export const DEFAULT_STACK_CONFIG: StackConfig = { gap: "md" };
export const DEFAULT_BUTTON_CONFIG: ButtonConfig = {
  label: "Submit",
  variant: "primary",
  disabled: false,
};

function getDefaultValue(field: CanvasField, def?: FormFieldDefinition): unknown {
  if (def?.defaultValue !== undefined) return def.defaultValue;
  if (field.fieldType === "Checkbox" || field.fieldType === "Switch") return false;
  if (field.fieldType === "Slider") return (field.props.min as number) ?? 0;
  return "";
}


function buildFormField(
  field: CanvasField,
  catalogMap: Record<string, FormFieldDefinition>
): FormField {
  const def = catalogMap[field.fieldType];
  const { name, value: _value, ...restProps } = field.props;
  if (def?.isStructural) {
    return { type: field.fieldType, props: restProps };
  }
  return {
    type: field.fieldType,
    name: name as string,
    defaultValue: getDefaultValue(field, def),
    props: restProps,
  };
}

function makeCanvasFieldFromFormField(field: FormField): CanvasField {
  const props: Record<string, unknown> = { ...(field.props ?? {}) };
  if (field.name) props.name = field.name;
  return {
    kind: "field",
    id: crypto.randomUUID(),
    elementKey: `field_${crypto.randomUUID().slice(0, 8)}`,
    fieldType: field.type,
    props,
  };
}

export function buildBuilderStateFromSpec(
  schema: Partial<FormSchema>,
  validFieldTypes: Set<string>
): Partial<FormBuilderState> {
  const items: CanvasItem[] = [];

  for (const item of schema.fields ?? []) {
    if (item.type === "Grid") {
      const row = item as FormRow;
      const fields: CanvasField[] = row.fields
        .filter((f) => validFieldTypes.has(f.type))
        .map(makeCanvasFieldFromFormField);
      items.push({
        kind: "grid",
        id: crypto.randomUUID(),
        elementKey: `grid_${crypto.randomUUID().slice(0, 8)}`,
        columns: row.columns,
        fields,
      });
    } else if (validFieldTypes.has(item.type)) {
      items.push(makeCanvasFieldFromFormField(item as FormField));
    }
  }

  const { gap = DEFAULT_STACK_CONFIG.gap, align, justify } = schema.layout ?? {};
  const {
    label = DEFAULT_BUTTON_CONFIG.label,
    variant = DEFAULT_BUTTON_CONFIG.variant,
    disabled = DEFAULT_BUTTON_CONFIG.disabled,
  } = schema.submit ?? {};

  return {
    items,
    formTitle: schema.title ?? "My Form",
    formDescription: schema.description ?? "",
    selectedFieldId: null,
    stackConfig: { gap, align, justify },
    buttonConfig: { label, variant, disabled },
  };
}

export function buildSpecFromBuilderState(
  state: FormBuilderState,
  catalogMap: Record<string, FormFieldDefinition> = {}
): FormSchema {
  const fields: FormItem[] = [];

  for (const item of state.items) {
    if (item.kind === "grid") {
      const grid = item as CanvasGrid;
      fields.push({
        type: "Grid",
        columns: grid.columns,
        fields: grid.fields.map((f) => buildFormField(f, catalogMap)),
      } as FormRow);
    } else {
      fields.push(buildFormField(item as CanvasField, catalogMap));
    }
  }

  const sc = state.stackConfig ?? DEFAULT_STACK_CONFIG;
  const bc = state.buttonConfig ?? DEFAULT_BUTTON_CONFIG;

  return {
    title: state.formTitle || undefined,
    description: state.formDescription || undefined,
    fields,
    layout: { gap: sc.gap, align: sc.align, justify: sc.justify },
    submit: { label: bc.label, variant: bc.variant, disabled: bc.disabled },
  };
}
