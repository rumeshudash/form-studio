"use client";

import { Columns2, Columns3, GripVertical } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { BUILT_IN_LAYOUT_DEFS } from "../shared/built-in-layout-defs";
import type { FieldType, FormFieldDefinition } from "../form-renderer/types";

// ─── Draggable chip ───────────────────────────────────────────────────────────

interface FieldChipProps {
  draggableId: string;
  dragData: Record<string, unknown>;
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}

function FieldChip({ draggableId, dragData, icon: Icon, label, onClick }: FieldChipProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: draggableId,
    data: dragData,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex items-center gap-1 w-full rounded-md border border-border bg-background",
        "text-sm transition-colors",
        isDragging && "opacity-40"
      )}
    >
      {/* Drag handle */}
      <button
        type="button"
        className="px-1.5 py-2 cursor-grab active:cursor-grabbing touch-none text-muted-foreground/40 hover:text-muted-foreground"
        {...attributes}
        {...listeners}
        aria-label="Drag to canvas"
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>

      {/* Click-to-add area */}
      <button
        type="button"
        onClick={onClick}
        className="flex items-center gap-2 flex-1 pr-3 py-2 text-left hover:text-accent-foreground cursor-pointer"
      >
        {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
        <span>{label}</span>
      </button>
    </div>
  );
}

// ─── Palette ──────────────────────────────────────────────────────────────────

interface FieldPaletteProps {
  catalog: FormFieldDefinition[];
  onAddField: (fieldType: FieldType) => void;
  onAddGrid: (columns: 2 | 3) => void;
}

export function FieldPalette({ catalog, onAddField, onAddGrid }: FieldPaletteProps) {
  const byCategory = catalog.reduce(
    (acc, def) => {
      if (!acc[def.category]) acc[def.category] = [];
      acc[def.category].push(def);
      return acc;
    },
    {} as Record<string, FormFieldDefinition[]>
  );

  return (
    <aside className="w-52 shrink-0 border-r border-border bg-muted/30 flex flex-col overflow-y-auto">
      <div className="px-3 py-3 border-b border-border">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Fields</p>
      </div>
      <div className="flex flex-col gap-4 p-3">
        {/* Layout */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5">Layout</p>
          <div className="flex flex-col gap-1">
            <FieldChip
              draggableId="palette:grid-2"
              dragData={{ source: "palette", kind: "grid", columns: 2 }}
              icon={Columns2}
              label="2 Columns"
              onClick={() => onAddGrid(2)}
            />
            <FieldChip
              draggableId="palette:grid-3"
              dragData={{ source: "palette", kind: "grid", columns: 3 }}
              icon={Columns3}
              label="3 Columns"
              onClick={() => onAddGrid(3)}
            />
            {BUILT_IN_LAYOUT_DEFS.map((def) => (
              <FieldChip
                key={def.fieldType}
                draggableId={`palette:${def.fieldType}`}
                dragData={{ source: "palette", kind: "field", fieldType: def.fieldType }}
                icon={def.icon}
                label={def.displayName}
                onClick={() => onAddField(def.fieldType)}
              />
            ))}
          </div>
        </div>

        {/* User catalog */}
        {Object.entries(byCategory).map(([category, defs]) => (
          <div key={category}>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">{category}</p>
            <div className="flex flex-col gap-1">
              {defs.map((def) => (
                <FieldChip
                  key={def.fieldType}
                  draggableId={`palette:${def.fieldType}`}
                  dragData={{ source: "palette", kind: "field", fieldType: def.fieldType }}
                  icon={def.icon}
                  label={def.displayName}
                  onClick={() => onAddField(def.fieldType)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
