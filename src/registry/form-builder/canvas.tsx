"use client";

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { useMemo } from "react";
import { LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { FieldPreview } from "./field-preview";
import { GridPreview } from "./grid-preview";
import type { CanvasItem, CanvasField, CanvasGrid, FormFieldDefinition } from "../form-renderer/types";

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
  /** Field id that is being dragged from root into a grid — hide its placeholder */
  draggingToGridId?: string | null;
}

export function BuilderCanvas({
  items, selectedFieldId, formTitle, catalogMap,
  onSelectField, onRemoveItem, onUpdateGridColumns, onClickCanvas,
  isDragOver, dragItem, draggingToGridId,
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
