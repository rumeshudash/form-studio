"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { FieldValidationRule, ValidationRuleType } from "../form-renderer/types";

interface ValidationBuilderProps {
  fieldId: string;
  rules: FieldValidationRule[];
  onChange: (rules: FieldValidationRule[]) => void;
}

const RULE_OPTIONS: Array<{
  value: ValidationRuleType;
  label: string;
  needsValue: boolean;
  valueLabel?: string;
}> = [
  { value: "required", label: "Required", needsValue: false },
  { value: "email", label: "Valid email", needsValue: false },
  { value: "url", label: "Valid URL", needsValue: false },
  { value: "numeric", label: "Numeric", needsValue: false },
  { value: "minLength", label: "Min length", needsValue: true, valueLabel: "Min chars" },
  { value: "maxLength", label: "Max length", needsValue: true, valueLabel: "Max chars" },
  { value: "min", label: "Min value", needsValue: true, valueLabel: "Min" },
  { value: "max", label: "Max value", needsValue: true, valueLabel: "Max" },
  { value: "pattern", label: "Pattern (regex)", needsValue: true, valueLabel: "Regex" },
];

function emptyRule(): FieldValidationRule {
  return { type: "required" };
}

function useStableKeys(length: number) {
  const keysRef = useRef<string[]>([]);
  if (keysRef.current.length < length) {
    for (let i = keysRef.current.length; i < length; i++) {
      keysRef.current.push(crypto.randomUUID());
    }
  }
  return keysRef;
}

export function ValidationBuilder({ rules, onChange }: ValidationBuilderProps) {
  const [collapsed, setCollapsed] = useState(false);
  const keysRef = useStableKeys(rules.length);

  const inputClass = cn(
    "w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs",
    "focus:outline-none focus:ring-1 focus:ring-ring"
  );

  function addRule() {
    keysRef.current.push(crypto.randomUUID());
    onChange([...rules, emptyRule()]);
  }

  function removeRule(idx: number) {
    keysRef.current.splice(idx, 1);
    onChange(rules.filter((_, i) => i !== idx));
  }

  function updateRule(idx: number, patch: Partial<FieldValidationRule>) {
    onChange(rules.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="text-xs font-medium text-foreground"
          onClick={() => setCollapsed((v) => !v)}
        >
          Validation {rules.length > 0 && `(${rules.length})`}
        </button>
        <button type="button" onClick={addRule} className="text-xs text-primary hover:underline">
          + Add
        </button>
      </div>

      {!collapsed &&
        rules.map((rule, idx) => {
          const stableKey = keysRef.current[idx] ?? idx;
          const def = RULE_OPTIONS.find((o) => o.value === rule.type);

          return (
            <div
              key={stableKey}
              className="flex flex-col gap-1.5 rounded-md border border-border p-2 bg-background relative"
            >
              <button
                type="button"
                onClick={() => removeRule(idx)}
                className="absolute top-1.5 right-1.5 text-muted-foreground hover:text-foreground text-xs leading-none"
                aria-label="Remove rule"
              >
                ✕
              </button>

              <label className="text-xs text-muted-foreground">Rule</label>
              <select
                className={inputClass}
                value={rule.type}
                onChange={(e) => {
                  const newType = e.target.value as ValidationRuleType;
                  const newDef = RULE_OPTIONS.find((o) => o.value === newType);
                  // Clear value if new type doesn't need one
                  updateRule(idx, {
                    type: newType,
                    value: newDef?.needsValue ? rule.value : undefined,
                  });
                }}
              >
                {RULE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>

              {def?.needsValue && (
                <>
                  <label className="text-xs text-muted-foreground">
                    {def.valueLabel ?? "Value"}
                  </label>
                  <input
                    type={rule.type === "pattern" ? "text" : "number"}
                    className={inputClass}
                    placeholder={def.valueLabel ?? "Value"}
                    value={rule.value !== undefined ? String(rule.value) : ""}
                    onChange={(e) => {
                      const raw = e.target.value;
                      updateRule(idx, {
                        value: rule.type === "pattern" ? raw : raw === "" ? undefined : Number(raw),
                      });
                    }}
                  />
                </>
              )}

              <label className="text-xs text-muted-foreground">Message (optional)</label>
              <input
                type="text"
                className={inputClass}
                placeholder="Leave empty for default"
                value={rule.message ?? ""}
                onChange={(e) => updateRule(idx, { message: e.target.value || undefined })}
              />
            </div>
          );
        })}
    </div>
  );
}
