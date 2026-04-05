"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
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

  const inputClass = cn(
    "w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs",
    "focus:outline-none focus:ring-1 focus:ring-ring"
  );

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
        <button
          type="button"
          className="text-xs font-medium text-foreground"
          onClick={() => setCollapsed((v) => !v)}
        >
          Conditions {conditions.length > 0 && `(${conditions.length})`}
        </button>
        {allFields.length > 0 && (
          <button
            type="button"
            onClick={addCondition}
            className="text-xs text-primary hover:underline"
          >
            + Add
          </button>
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
              <button
                type="button"
                onClick={() => removeCondition(idx)}
                className="absolute top-1.5 right-1.5 text-muted-foreground hover:text-foreground text-xs leading-none"
                aria-label="Remove condition"
              >
                ✕
              </button>

              <label className="text-xs text-muted-foreground">When</label>
              <select
                className={inputClass}
                value={cond.triggerField}
                onChange={(e) => {
                  const newField = allFields.find((f) => f.name === e.target.value);
                  const newOps = newField
                    ? getOperatorsForField(newField.fieldType)
                    : ALL_OPERATORS;
                  const validOp = newOps.some((o) => o.value === cond.operator)
                    ? cond.operator
                    : newOps[0]!.value;
                  updateCondition(idx, { triggerField: e.target.value, operator: validOp });
                }}
              >
                {allFields.map((f) => (
                  <option key={f.name} value={f.name}>
                    {f.label}
                  </option>
                ))}
              </select>

              <select
                className={inputClass}
                value={cond.operator}
                onChange={(e) =>
                  updateCondition(idx, { operator: e.target.value as ConditionOperator })
                }
              >
                {operators.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>

              {needsValue(cond.operator) && (
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Value…"
                  value={cond.value !== undefined ? String(cond.value) : ""}
                  onChange={(e) => updateCondition(idx, { value: e.target.value })}
                />
              )}

              <label className="text-xs text-muted-foreground mt-1">Then</label>
              <select
                className={inputClass}
                value={cond.action}
                onChange={(e) =>
                  updateCondition(idx, { action: e.target.value as ConditionAction })
                }
              >
                {actions.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </select>

              {cond.action === "compute" && (
                <input
                  type="text"
                  className={inputClass}
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
