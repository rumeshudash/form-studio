"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type {
  ButtonConfig,
  CanvasField,
  ConfigurableProp,
  FieldCondition,
  FieldValidationRule,
  FormFieldDefinition,
  StackConfig,
} from "../form-renderer/types";
import { ConditionBuilder } from "./condition-builder";
import { ValidationBuilder } from "./validation-builder";

interface FieldConfigPanelProps {
  field: CanvasField | null;
  catalogMap: Record<string, FormFieldDefinition>;
  onUpdateProp: (id: string, propKey: string, value: unknown) => void;
  onUpdateConditions: (id: string, conditions: FieldCondition[]) => void;
  onUpdateValidation: (id: string, rules: FieldValidationRule[]) => void;
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
  onUpdateValidation,
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
          {!def.isStructural && (
            <div className="border-t border-border pt-3">
              <ValidationBuilder
                fieldId={field.id}
                rules={field.validation ?? []}
                onChange={(rules) => onUpdateValidation(field.id, rules)}
              />
            </div>
          )}
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
  return (
    <div className="flex flex-col gap-1">
      <Label className="text-xs text-muted-foreground font-normal">{prop.label}</Label>

      {prop.inputType === "text" && (
        <Input
          type="text"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {prop.inputType === "number" && (
        <Input
          type="number"
          value={(value as number) ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        />
      )}

      {prop.inputType === "boolean" && (
        <Checkbox
          checked={(value as boolean) ?? false}
          onCheckedChange={(checked) => onChange(checked)}
        />
      )}

      {prop.inputType === "select" && prop.options && (
        <Select value={(value as string) ?? ""} onValueChange={(val) => onChange(val)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {prop.options.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {prop.inputType === "options-list" && (
        <Textarea
          rows={4}
          className="resize-none text-sm"
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
