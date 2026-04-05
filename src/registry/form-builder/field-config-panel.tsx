"use client";

import { cn } from "@/lib/utils";
import type {
  ButtonConfig,
  CanvasField,
  ConfigurableProp,
  FieldCondition,
  FormFieldDefinition,
  StackConfig,
} from "../form-renderer/types";
import { ConditionBuilder } from "./condition-builder";

interface FieldConfigPanelProps {
  field: CanvasField | null;
  catalogMap: Record<string, FormFieldDefinition>;
  onUpdateProp: (id: string, propKey: string, value: unknown) => void;
  onUpdateConditions: (id: string, conditions: FieldCondition[]) => void;
  allFields: Array<{ name: string; label: string; fieldType: string }>;
  stackConfig: StackConfig;
  buttonConfig: ButtonConfig;
  onUpdateStackConfig: <K extends keyof StackConfig>(key: K, value: StackConfig[K]) => void;
  onUpdateButtonConfig: <K extends keyof ButtonConfig>(key: K, value: ButtonConfig[K]) => void;
}

export function FieldConfigPanel({
  field,
  catalogMap,
  onUpdateProp,
  onUpdateConditions,
  allFields,
  stackConfig,
  buttonConfig,
  onUpdateStackConfig,
  onUpdateButtonConfig,
}: FieldConfigPanelProps) {
  const def = field ? catalogMap[field.fieldType] : null;

  return (
    <aside className="w-60 shrink-0 border-l border-border bg-muted/30 flex flex-col overflow-y-auto">
      <div className="px-3 py-3 border-b border-border">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Properties
        </p>
      </div>

      {field && def ? (
        <div className="flex flex-col gap-4 p-3">
          <div>
            <p className="text-xs font-medium text-foreground mb-2">{def.displayName}</p>
          </div>
          {def.configurableProps.map((prop) => (
            <PropEditor
              key={prop.key}
              prop={prop}
              value={field.props[prop.key]}
              onChange={(value) => onUpdateProp(field.id, prop.key, value)}
            />
          ))}
          <div className="border-t border-border pt-3">
            <ConditionBuilder
              fieldId={field.id}
              conditions={field.conditions ?? []}
              allFields={allFields.filter((f) => f.name !== (field.props.name as string))}
              isStructural={def.isStructural ?? false}
              onChange={(conds) => onUpdateConditions(field.id, conds)}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 p-3">
          {/* Stack / Layout config */}
          <div>
            <p className="text-xs font-semibold text-foreground mb-2">Layout</p>
            <div className="flex flex-col gap-3">
              <PropEditor
                prop={{
                  key: "gap",
                  label: "Gap",
                  inputType: "select",
                  options: ["none", "sm", "md", "lg", "xl"],
                }}
                value={stackConfig.gap}
                onChange={(v) => onUpdateStackConfig("gap", v as StackConfig["gap"])}
              />
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-xs font-semibold text-foreground mb-2">Submit Button</p>
            <div className="flex flex-col gap-3">
              <PropEditor
                prop={{ key: "label", label: "Label", inputType: "text" }}
                value={buttonConfig.label}
                onChange={(v) => onUpdateButtonConfig("label", v as string)}
              />
              <PropEditor
                prop={{
                  key: "variant",
                  label: "Variant",
                  inputType: "select",
                  options: ["primary", "secondary", "outline", "ghost", "danger"],
                }}
                value={buttonConfig.variant}
                onChange={(v) => onUpdateButtonConfig("variant", v as ButtonConfig["variant"])}
              />
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

interface PropEditorProps {
  prop: ConfigurableProp;
  value: unknown;
  onChange: (value: unknown) => void;
}

function PropEditor({ prop, value, onChange }: PropEditorProps) {
  const inputClass = cn(
    "w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm",
    "focus:outline-none focus:ring-1 focus:ring-ring"
  );

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-muted-foreground">{prop.label}</label>

      {prop.inputType === "text" && (
        <input
          type="text"
          className={inputClass}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {prop.inputType === "number" && (
        <input
          type="number"
          className={inputClass}
          value={(value as number) ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        />
      )}

      {prop.inputType === "boolean" && (
        <input
          type="checkbox"
          checked={(value as boolean) ?? false}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded border-input"
        />
      )}

      {prop.inputType === "select" && prop.options && (
        <select
          className={inputClass}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        >
          {prop.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      )}

      {prop.inputType === "options-list" && (
        <textarea
          className={cn(inputClass, "resize-none")}
          rows={4}
          value={Array.isArray(value) ? (value as string[]).join("\n") : ""}
          onChange={(e) =>
            onChange(
              e.target.value
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean)
            )
          }
          placeholder="One option per line"
        />
      )}
    </div>
  );
}
