import { Heading as HeadingIcon, Type } from "lucide-react";
import type { FormFieldDefinition } from "../form-renderer/types";

/**
 * Built-in structural layout field definitions.
 * Always available in FormBuilder regardless of the user's catalog.
 * These render via STRUCTURAL_COMPONENTS — no customFields needed.
 */
export const BUILT_IN_LAYOUT_DEFS: FormFieldDefinition[] = [
  {
    fieldType: "Heading",
    displayName: "Heading",
    icon: HeadingIcon,
    category: "Layout",
    isStructural: true,
    defaultProps: { text: "Heading", level: "h2" },
    configurableProps: [
      { key: "text", label: "Text", inputType: "text" },
      {
        key: "level",
        label: "Level",
        inputType: "select",
        options: ["h1", "h2", "h3", "h4"],
      },
    ],
  },
  {
    fieldType: "Text",
    displayName: "Text",
    icon: Type,
    category: "Layout",
    isStructural: true,
    defaultProps: { text: "Some text here", variant: "default" },
    configurableProps: [
      { key: "text", label: "Content", inputType: "text" },
      {
        key: "variant",
        label: "Variant",
        inputType: "select",
        options: ["default", "muted", "caption", "lead", "code"],
      },
    ],
  },
];

export const BUILT_IN_LAYOUT_MAP: Record<string, FormFieldDefinition> = Object.fromEntries(
  BUILT_IN_LAYOUT_DEFS.map((d) => [d.fieldType, d])
);
