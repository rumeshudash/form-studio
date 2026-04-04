"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Box, GripVertical, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CanvasField, FormFieldDefinition } from "../form-renderer/types";

interface FieldPreviewProps {
  field: CanvasField;
  definition?: FormFieldDefinition;
  isSelected: boolean;
  className?: string;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  invisible?: boolean;
}

export function FieldPreview({
  field,
  definition,
  isSelected,
  className,
  onSelect,
  onRemove,
  invisible,
}: FieldPreviewProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = definition?.icon ?? Box;
  const label = (field.props.label as string) || field.fieldType;
  const name = field.props.name as string;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-2 rounded-lg border bg-background p-3 cursor-pointer select-none",
        isSelected
          ? "border-primary ring-1 ring-primary"
          : "border-border hover:border-muted-foreground/40",
        isDragging && "opacity-50 shadow-lg z-50",
        invisible && "opacity-0 pointer-events-none",
        className
      )}
      onClick={() => onSelect(field.id)}
    >
      <button
        type="button"
        className="cursor-grab active:cursor-grabbing touch-none text-muted-foreground/50 hover:text-muted-foreground"
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{label}</p>
        <p className="text-xs text-muted-foreground truncate">{name}</p>
      </div>

      <button
        type="button"
        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(field.id);
        }}
        aria-label="Remove field"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
