"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  rectSortingStrategy,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, LayoutGrid, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  CanvasField,
  CanvasGrid,
  CanvasItem,
  FormFieldDefinition,
} from "../form-renderer/types";
import { FieldPreview } from "./field-preview";

// ─── GridPreview ──────────────────────────────────────────────────────────────

interface GridPreviewProps {
  grid: CanvasGrid;
  selectedFieldId: string | null;
  catalogMap: Record<string, FormFieldDefinition>;
  onSelectField: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onUpdateColumns: (gridId: string, columns: 2 | 3) => void;
}

function GridPreview({
  grid,
  selectedFieldId,
  catalogMap,
  onSelectField,
  onRemoveItem,
  onUpdateColumns,
}: GridPreviewProps) {
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: grid.id });

  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: `${grid.id}-inner` });

  const style = { transform: CSS.Transform.toString(transform), transition };
  const fieldIds = useMemo(() => grid.fields.map((f) => f.id), [grid.fields]);

  return (
    <div
      ref={setSortableRef}
      style={style}
      className={cn(
        "rounded-lg border bg-muted/20 select-none",
        isDragging && "opacity-50 shadow-lg z-50"
      )}
    >
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="cursor-grab active:cursor-grabbing touch-none text-muted-foreground/50 hover:text-muted-foreground"
          {...attributes}
          {...listeners}
          aria-label="Drag grid to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </Button>

        <LayoutGrid className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground flex-1">Grid</span>

        <div className="flex items-center gap-1">
          {([2, 3] as const).map((n) => (
            <Button
              key={n}
              type="button"
              variant={grid.columns === n ? "default" : "ghost"}
              size="xs"
              onClick={() => onUpdateColumns(grid.id, n)}
            >
              {n}
            </Button>
          ))}
          <span className="text-xs text-muted-foreground ml-0.5">cols</span>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-destructive transition-colors"
          onClick={() => onRemoveItem(grid.id)}
          aria-label="Remove grid"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div
        ref={setDropRef}
        className={cn("p-2 transition-colors rounded-b-lg", isOver && "bg-primary/5")}
      >
        {grid.fields.length === 0 ? (
          <div className="flex items-center justify-center py-6 border border-dashed border-border rounded-md text-xs text-muted-foreground">
            Drop fields here
          </div>
        ) : (
          <SortableContext items={fieldIds} strategy={rectSortingStrategy}>
            <div
              className="grid gap-2"
              style={{ gridTemplateColumns: `repeat(${grid.columns}, 1fr)` }}
            >
              {grid.fields.map((field: CanvasField) => (
                <FieldPreview
                  key={field.id}
                  field={field}
                  definition={catalogMap[field.fieldType]}
                  isSelected={selectedFieldId === field.id}
                  onSelect={onSelectField}
                  onRemove={onRemoveItem}
                />
              ))}
            </div>
          </SortableContext>
        )}
      </div>
    </div>
  );
}

// ─── BuilderCanvas ────────────────────────────────────────────────────────────

interface BuilderCanvasProps {
  items: CanvasItem[];
  selectedFieldId: string | null;
  formTitle: string;
  catalogMap: Record<string, FormFieldDefinition>;
  onSelectField: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onUpdateGridColumns: (gridId: string, columns: 2 | 3) => void;
  onClickCanvas: () => void;
  isDragOver?: boolean;
  dragItem?: { label: string; icon?: FormFieldDefinition["icon"]; isFromRoot?: boolean } | null;
  /** Field id being dragged from root into a grid — hide its placeholder */
  draggingToGridId?: string | null;
}

export function BuilderCanvas({
  items,
  selectedFieldId,
  formTitle,
  catalogMap,
  onSelectField,
  onRemoveItem,
  onUpdateGridColumns,
  onClickCanvas,
  isDragOver,
  dragItem,
  draggingToGridId,
}: BuilderCanvasProps) {
  const { setNodeRef } = useDroppable({ id: "root" });
  const topLevelIds = useMemo(
    () => items.map((i) => i.id).filter((id) => id !== draggingToGridId),
    [items, draggingToGridId]
  );

  return (
    <main className="flex-1 overflow-y-auto bg-muted/10 p-6" onClick={onClickCanvas}>
      <div className="max-w-2xl mx-auto">
        <p className="text-lg font-semibold mb-4 text-center">{formTitle || "Untitled Form"}</p>
        <SortableContext items={topLevelIds} strategy={verticalListSortingStrategy}>
          <div
            ref={setNodeRef}
            className={cn(
              "flex flex-col gap-2 min-h-32 rounded-xl transition-colors p-4",
              isDragOver && "outline-dashed outline-2 outline-primary/50 bg-primary/5"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {items.length === 0 && !isDragOver ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 border-2 border-dashed border-border rounded-xl text-muted-foreground">
                <LayoutGrid className="h-8 w-8" />
                <p className="text-sm">Click a field from the left panel to add it</p>
              </div>
            ) : (
              <>
                {items.map((item) =>
                  item.kind === "grid" ? (
                    <GridPreview
                      key={item.id}
                      grid={item as CanvasGrid}
                      selectedFieldId={selectedFieldId}
                      catalogMap={catalogMap}
                      onSelectField={onSelectField}
                      onRemoveItem={onRemoveItem}
                      onUpdateColumns={onUpdateGridColumns}
                    />
                  ) : (
                    <FieldPreview
                      key={item.id}
                      field={item as CanvasField}
                      definition={catalogMap[item.fieldType]}
                      isSelected={selectedFieldId === item.id}
                      onSelect={onSelectField}
                      onRemove={onRemoveItem}
                      invisible={draggingToGridId === item.id}
                    />
                  )
                )}

                {isDragOver && dragItem && !dragItem.isFromRoot && (
                  <DropGhost label={dragItem.label} icon={dragItem.icon} />
                )}
              </>
            )}
          </div>
        </SortableContext>
      </div>
    </main>
  );
}

function DropGhost({ label, icon: Icon }: { label: string; icon?: FormFieldDefinition["icon"] }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border-2 border-dashed border-primary/60 bg-primary/5 p-3 opacity-70 pointer-events-none select-none">
      {Icon ? (
        <Icon className="h-4 w-4 shrink-0 text-primary/60" />
      ) : (
        <div className="h-4 w-4 shrink-0 rounded bg-primary/20" />
      )}
      <span className="text-sm text-primary/70">{label}</span>
    </div>
  );
}
