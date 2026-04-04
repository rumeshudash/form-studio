"use client";

import { useSortable, SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { useMemo } from "react";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { FieldPreview } from "./field-preview";
import type { CanvasGrid, CanvasField, FormFieldDefinition } from "../form-renderer/types";

interface GridPreviewProps {
  grid: CanvasGrid;
  selectedFieldId: string | null;
  catalogMap: Record<string, FormFieldDefinition>;
  onSelectField: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onUpdateColumns: (gridId: string, columns: 2 | 3) => void;
}

export function GridPreview({
  grid,
  selectedFieldId,
  catalogMap,
  onSelectField,
  onRemoveItem,
  onUpdateColumns,
}: GridPreviewProps) {
  // The grid container itself is sortable at the root level
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: grid.id });

  // Inner drop zone uses a distinct id so collision detection can differentiate
  // "drop into this grid" from "reorder this grid at root level"
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: `${grid.id}-inner` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

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
      {/* Grid header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
        <button
          type="button"
          className="cursor-grab active:cursor-grabbing touch-none text-muted-foreground/50 hover:text-muted-foreground"
          {...attributes}
          {...listeners}
          aria-label="Drag grid to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <LayoutGrid className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground flex-1">Grid</span>

        {/* Column picker */}
        <div className="flex items-center gap-1">
          {([2, 3] as const).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onUpdateColumns(grid.id, n)}
              className={cn(
                "px-1.5 py-0.5 rounded text-xs transition-colors",
                grid.columns === n
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {n}
            </button>
          ))}
          <span className="text-xs text-muted-foreground ml-0.5">cols</span>
        </div>

        <button
          type="button"
          className="text-muted-foreground hover:text-destructive transition-colors"
          onClick={() => onRemoveItem(grid.id)}
          aria-label="Remove grid"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Drop zone */}
      <div
        ref={setDropRef}
        className={cn(
          "p-2 transition-colors rounded-b-lg",
          isOver && "bg-primary/5"
        )}
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
