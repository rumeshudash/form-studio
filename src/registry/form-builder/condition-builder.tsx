"use client";

import { X } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ConditionAction, ConditionOperator, FieldCondition } from "../form-renderer/types";

interface FieldRef {
  name: string;
  label: string;
  fieldType: string;
}

interface ConditionBuilderProps {
  fieldId: string;
  conditions: FieldCondition[];
  allFields: FieldRef[];
  isStructural: boolean;
  onChange: (conditions: FieldCondition[]) => void;
}

const BOOLEAN_FIELD_TYPES = new Set(["CheckboxField", "SwitchField"]);
const NUMERIC_FIELD_TYPES = new Set(["SliderField", "RatingInput"]);

const ALL_OPERATORS: Array<{ value: ConditionOperator; label: string }> = [
  { value: "eq", label: "equals" },
  { value: "neq", label: "not equals" },
  { value: "gt", label: "greater than" },
  { value: "gte", label: "≥" },
  { value: "lt", label: "less than" },
  { value: "lte", label: "≤" },
  { value: "truthy", label: "is filled" },
  { value: "falsy", label: "is empty" },
];

const BOOLEAN_OPERATORS: Array<{ value: ConditionOperator; label: string }> = [
  { value: "truthy", label: "is checked" },
  { value: "falsy", label: "is unchecked" },
];

function getOperatorsForField(fieldType: string) {
  if (BOOLEAN_FIELD_TYPES.has(fieldType)) return BOOLEAN_OPERATORS;
  if (NUMERIC_FIELD_TYPES.has(fieldType)) return ALL_OPERATORS;
  return ALL_OPERATORS.filter((o) => ["eq", "neq", "truthy", "falsy"].includes(o.value));
}

const ACTIONS_ALL: Array<{ value: ConditionAction; label: string }> = [
  { value: "show", label: "Show this field" },
  { value: "hide", label: "Hide this field" },
  { value: "enable", label: "Enable this field" },
  { value: "disable", label: "Disable this field" },
  { value: "compute", label: "Set value to…" },
];

const ACTIONS_STRUCTURAL: Array<{ value: ConditionAction; label: string }> = [
  { value: "show", label: "Show this element" },
  { value: "hide", label: "Hide this element" },
];

function emptyCondition(allFields: FieldRef[]): FieldCondition {
  return {
    triggerField: allFields[0]?.name ?? "",
    operator: "truthy",
    action: "show",
  };
}

function needsValue(operator: ConditionOperator): boolean {
  return !["truthy", "falsy"].includes(operator);
}

// Stable key tracking — avoids array-index-as-key without polluting FieldCondition type
function useStableKeys(length: number) {
  const keysRef = useRef<string[]>([]);
  if (keysRef.current.length < length) {
    for (let i = keysRef.current.length; i < length; i++) {
      keysRef.current.push(crypto.randomUUID());
    }
  }
  return keysRef;
}

export function ConditionBuilder({
  conditions,
  allFields,
  isStructural,
  onChange,
}: ConditionBuilderProps) {
  const [collapsed, setCollapsed] = useState(false);
  const keysRef = useStableKeys(conditions.length);

  const actions = isStructural ? ACTIONS_STRUCTURAL : ACTIONS_ALL;

  function addCondition() {
    keysRef.current.push(crypto.randomUUID());
    onChange([...conditions, emptyCondition(allFields)]);
  }

  function removeCondition(idx: number) {
    keysRef.current.splice(idx, 1);
    onChange(conditions.filter((_, i) => i !== idx));
  }

  function updateCondition(idx: number, patch: Partial<FieldCondition>) {
    onChange(conditions.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="xs"
          className="px-0 text-xs font-medium text-foreground hover:bg-transparent"
          onClick={() => setCollapsed((v) => !v)}
        >
          Conditions {conditions.length > 0 && `(${conditions.length})`}
        </Button>
        {allFields.length > 0 && (
          <Button type="button" variant="link" size="xs" onClick={addCondition}>
            + Add
          </Button>
        )}
      </div>

      {!collapsed && allFields.length === 0 && conditions.length === 0 && (
        <p className="text-xs text-muted-foreground">Add more fields to create conditions.</p>
      )}

      {!collapsed &&
        conditions.map((cond, idx) => {
          const triggerDef = allFields.find((f) => f.name === cond.triggerField);
          const operators = triggerDef ? getOperatorsForField(triggerDef.fieldType) : ALL_OPERATORS;
          const stableKey = keysRef.current[idx] ?? idx;

          return (
            <div
              key={stableKey}
              className="flex flex-col gap-1.5 rounded-md border border-border p-2 bg-background relative"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => removeCondition(idx)}
                className="absolute top-1 right-1 text-muted-foreground hover:text-foreground"
                aria-label="Remove condition"
              >
                <X className="h-3 w-3" />
              </Button>

              <Label className="text-xs text-muted-foreground font-normal">When</Label>
              <Select
                value={cond.triggerField}
                onValueChange={(val) => {
                  const newField = allFields.find((f) => f.name === val);
                  const newOps = newField
                    ? getOperatorsForField(newField.fieldType)
                    : ALL_OPERATORS;
                  const validOp = newOps.some((o) => o.value === cond.operator)
                    ? cond.operator
                    : newOps[0]!.value;
                  updateCondition(idx, { triggerField: val ?? undefined, operator: validOp });
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allFields.map((f) => (
                    <SelectItem key={f.name} value={f.name}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={cond.operator}
                onValueChange={(val) =>
                  updateCondition(idx, { operator: val as ConditionOperator })
                }
              >
                <SelectTrigger className="w-full" size="sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {operators.map((op) => (
                    <SelectItem key={op.value} value={op.value}>
                      {op.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {needsValue(cond.operator) && (
                <Input
                  type="text"
                  placeholder="Value…"
                  value={cond.value !== undefined ? String(cond.value) : ""}
                  onChange={(e) => updateCondition(idx, { value: e.target.value })}
                />
              )}

              <Label className="text-xs text-muted-foreground font-normal mt-1">Then</Label>
              <Select
                value={cond.action}
                onValueChange={(val) => updateCondition(idx, { action: val as ConditionAction })}
              >
                <SelectTrigger className="w-full" size="sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {actions.map((a) => (
                    <SelectItem key={a.value} value={a.value}>
                      {a.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {cond.action === "compute" && (
                <Input
                  type="text"
                  placeholder="Value or @fieldName"
                  value={cond.computeValue ?? ""}
                  onChange={(e) => updateCondition(idx, { computeValue: e.target.value })}
                />
              )}
            </div>
          );
        })}
    </div>
  );
}
