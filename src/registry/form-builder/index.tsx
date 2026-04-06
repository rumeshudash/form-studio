"use client";

import {
  type CollisionDetection,
  closestCenter,
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type {
  CanvasField,
  FieldType,
  FormFieldDefinition,
  FormFieldEntry,
  FormSchema,
} from "../form-renderer/types";
import { findContainer, useFormBuilderState } from "./builder-state";
import { BuilderCanvas } from "./canvas";
import { FieldConfigPanel } from "./field-config-panel";
import { FieldPalette } from "./field-palette";
import { FieldPreview } from "./field-preview";

export interface FormBuilderProps {
  catalog: FormFieldEntry[];
  defaultSchema?: Partial<FormSchema>;
  onChange?: (schema: FormSchema) => void;
  /** Extra content rendered at the right end of the builder's header bar. */
  actions?: React.ReactNode;
  className?: string;
}

export function FormBuilder({
  catalog,
  defaultSchema,
  onChange,
  actions,
  className,
}: FormBuilderProps) {
  const catalogMap = useMemo(
    () => Object.fromEntries(catalog.map((d) => [d.fieldType, d])),
    [catalog]
  );

  const {
    state,
    schema,
    addField,
    addGrid,
    removeItem,
    reorderItems,
    reorderFieldsInGrid,
    moveField,
    updateFieldProp,
    updateFieldConditions,
    updateFieldValidation,
    updateGridColumns,
    updateStackConfig,
    updateButtonConfig,
    selectField,
    setFormMeta,
    fullCatalogMap,
  } = useFormBuilderState(catalogMap, defaultSchema ? { fromSchema: defaultSchema } : undefined);

  const allFields = useMemo(
    () =>
      state.items
        .flatMap((item) => (item.kind === "grid" ? item.fields : [item as CanvasField]))
        .filter((f) => {
          const def = fullCatalogMap[f.fieldType];
          return !def?.isStructural && f.props.name;
        })
        .map((f) => ({
          name: f.props.name as string,
          label: (f.props.label as string) || f.fieldType,
          fieldType: f.fieldType,
        })),
    [state.items, fullCatalogMap]
  );

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    onChangeRef.current?.(schema);
  }, [schema]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // Use pointer-within as primary, sorted by rect area so the smallest (most specific)
  // droppable wins — e.g. a grid's inner zone beats the grid's sortable rect, which
  // beats the root canvas. Falls back to closestCenter when pointer is outside all rects.
  const collisionDetection: CollisionDetection = (args) => {
    const within = pointerWithin(args);
    if (within.length > 0) {
      return [...within].sort((a, b) => {
        const ra = args.droppableRects.get(a.id);
        const rb = args.droppableRects.get(b.id);
        if (!ra || !rb) return 0;
        return ra.width * ra.height - rb.width * rb.height;
      });
    }
    return closestCenter(args);
  };

  const [activeField, setActiveField] = useState<CanvasField | null>(null);
  const [activePaletteLabel, setActivePaletteLabel] = useState<string | null>(null);
  const [overContainerId, setOverContainerId] = useState<string | null>(null);
  const [dragItem, setDragItem] = useState<{
    label: string;
    icon?: FormFieldDefinition["icon"];
    isFromRoot?: boolean;
  } | null>(null);

  function findField(fieldId: string): CanvasField | undefined {
    for (const item of state.items) {
      if (item.kind === "field" && item.id === fieldId) return item;
      if (item.kind === "grid") {
        const f = item.fields.find((f) => f.id === fieldId);
        if (f) return f;
      }
    }
  }

  function handleDragStart(event: DragStartEvent) {
    setOverContainerId(null);
    const data = event.active.data.current;

    if (data?.source === "palette") {
      if (data.kind === "grid") {
        const label = `${data.columns} Columns`;
        setActivePaletteLabel(label);
        setDragItem({ label });
      } else {
        const def = fullCatalogMap[data.fieldType as string];
        const label = def?.displayName ?? String(data.fieldType);
        setActivePaletteLabel(label);
        setDragItem({ label, icon: def?.icon });
      }
      return;
    }

    const id = String(event.active.id);
    const field = findField(id);
    if (field) {
      setActiveField(field);
      const def = fullCatalogMap[field.fieldType];
      const isFromRoot = state.items.some((i) => i.kind === "field" && i.id === id);
      setDragItem({
        label: (field.props.label as string) || field.fieldType,
        icon: def?.icon,
        isFromRoot,
      });
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { over } = event;
    if (!over) {
      setOverContainerId(null);
      return;
    }

    const overId = String(over.id);
    // Inner grid droppable → field would go into that grid
    if (overId.endsWith("-inner")) {
      setOverContainerId(overId.slice(0, -6));
      return;
    }
    // Grid sortable rect or field or root → resolve via findContainer
    // (grid as sortable item resolves to "root"; field in grid resolves to gridId)
    setOverContainerId(findContainer(state.items, overId));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveField(null);
    setActivePaletteLabel(null);
    setOverContainerId(null);
    setDragItem(null);

    const data = active.data.current;

    // ── Palette drop ──────────────────────────────────────────────────────────
    if (data?.source === "palette") {
      if (!over) return;
      const overId = String(over.id);

      if (data.kind === "grid") {
        addGrid(data.columns as 2 | 3);
        return;
      }

      const isInner = overId.endsWith("-inner");
      const targetGridId = isInner ? overId.slice(0, -6) : null;
      const overIsGrid =
        isInner && state.items.some((i) => i.kind === "grid" && i.id === targetGridId);
      addField(data.fieldType as string, overIsGrid ? targetGridId! : undefined);
      return;
    }

    // ── Canvas drop ───────────────────────────────────────────────────────────
    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const fromContainer = findContainer(state.items, activeId);
    const isInner = overId.endsWith("-inner");
    const targetGridId = isInner ? overId.slice(0, -6) : null;
    const overIsGrid =
      !!targetGridId && state.items.some((i) => i.kind === "grid" && i.id === targetGridId);
    const toContainer = overIsGrid ? targetGridId! : findContainer(state.items, overId);

    if (fromContainer === toContainer) {
      // Same container — reorder (overId may be a grid id when sorting near it)
      if (fromContainer === "root") {
        reorderItems(activeId, overId);
      } else {
        reorderFieldsInGrid(fromContainer, activeId, overId);
      }
    } else {
      // Cross-container move — committed only on drop, no live moves during drag
      moveField(activeId, fromContainer, toContainer, overIsGrid ? undefined : overId);
    }
  }

  const selectedField = state.selectedFieldId
    ? (state.items
        .flatMap((i) => (i.kind === "grid" ? i.fields : [i as CanvasField]))
        .find((f) => f.id === state.selectedFieldId) ?? null)
    : null;

  return (
    <div className={cn("flex flex-col h-full w-full overflow-hidden", className)}>
      <header className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-background shrink-0">
        <Input
          type="text"
          value={state.formTitle}
          onChange={(e) => setFormMeta("formTitle", e.target.value)}
          placeholder="Form title..."
          className="flex-1 border-none bg-transparent shadow-none focus-visible:ring-0 text-sm font-medium px-0 h-auto"
        />
        {actions}
      </header>

      <div className="flex flex-1 overflow-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetection}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <FieldPalette
            catalog={catalog}
            onAddField={(ft: FieldType) => addField(ft)}
            onAddGrid={addGrid}
          />

          <BuilderCanvas
            items={state.items}
            selectedFieldId={state.selectedFieldId}
            formTitle={state.formTitle}
            catalogMap={fullCatalogMap}
            onSelectField={selectField}
            onRemoveItem={removeItem}
            onUpdateGridColumns={updateGridColumns}
            onClickCanvas={() => selectField(null)}
            isDragOver={overContainerId === "root"}
            dragItem={dragItem}
            draggingToGridId={
              activeField && dragItem?.isFromRoot && overContainerId && overContainerId !== "root"
                ? activeField.id
                : null
            }
          />

          <DragOverlay dropAnimation={null}>
            {activeField ? (
              <FieldPreview
                field={activeField}
                definition={fullCatalogMap[activeField.fieldType]}
                isSelected={false}
                onSelect={() => {}}
                onRemove={() => {}}
              />
            ) : activePaletteLabel ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-primary bg-background text-sm shadow-lg">
                {activePaletteLabel}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        <FieldConfigPanel
          field={selectedField}
          catalogMap={fullCatalogMap}
          onUpdateProp={updateFieldProp}
          onUpdateConditions={updateFieldConditions}
          onUpdateValidation={updateFieldValidation}
          allFields={allFields}
          stackConfig={state.stackConfig}
          buttonConfig={state.buttonConfig}
          onUpdateStackConfig={updateStackConfig}
          onUpdateButtonConfig={updateButtonConfig}
        />
      </div>
    </div>
  );
}
