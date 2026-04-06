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
        <Button
          type="button"
          variant="ghost"
          size="xs"
          className="px-0 text-xs font-medium text-foreground hover:bg-transparent"
          onClick={() => setCollapsed((v) => !v)}
        >
          Validation {rules.length > 0 && `(${rules.length})`}
        </Button>
        <Button type="button" variant="link" size="xs" onClick={addRule}>
          + Add
        </Button>
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
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => removeRule(idx)}
                className="absolute top-1 right-1 text-muted-foreground hover:text-foreground"
                aria-label="Remove rule"
              >
                <X className="h-3 w-3" />
              </Button>

              <Label className="text-xs text-muted-foreground font-normal">Rule</Label>
              <Select
                value={rule.type}
                onValueChange={(val) => {
                  const newType = val as ValidationRuleType;
                  const newDef = RULE_OPTIONS.find((o) => o.value === newType);
                  updateRule(idx, {
                    type: newType,
                    value: newDef?.needsValue ? rule.value : undefined,
                  });
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RULE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {def?.needsValue && (
                <>
                  <Label className="text-xs text-muted-foreground font-normal">
                    {def.valueLabel ?? "Value"}
                  </Label>
                  <Input
                    type={rule.type === "pattern" ? "text" : "number"}
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

              <Label className="text-xs text-muted-foreground font-normal">
                Message (optional)
              </Label>
              <Input
                type="text"
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
