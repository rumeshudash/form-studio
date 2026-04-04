"use client";

import { useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import type { StateStore, StateModel } from "@json-render/react";

function getByJsonPointer(obj: Record<string, unknown>, path: string): unknown {
  if (!path || path === "/") return obj;
  const parts = path.replace(/^\//, "").split("/");
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

function setByJsonPointer(
  obj: Record<string, unknown>,
  path: string,
  value: unknown
): Record<string, unknown> {
  if (!path || path === "/") return obj;
  const parts = path.replace(/^\//, "").split("/");
  const next = { ...obj };
  let current: Record<string, unknown> = next;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    current[part] = { ...(current[part] as Record<string, unknown>) };
    current = current[part] as Record<string, unknown>;
  }
  current[parts[parts.length - 1]] = value;
  return next;
}

export function useRhfStateStore(defaultValues: Record<string, unknown> = {}) {
  const form = useForm<Record<string, unknown>>({
    defaultValues,
    mode: "onBlur",
  });

  const listenersRef = useRef(new Set<() => void>());
  const snapshotRef = useRef<StateModel>({ ...defaultValues });

  form.watch((values) => {
    snapshotRef.current = values as StateModel;
    listenersRef.current.forEach((l) => l());
  });

  const store = useMemo<StateStore>(
    () => ({
      get: (path) => getByJsonPointer(snapshotRef.current, path),

      set: (path, value) => {
        const key = path.replace(/^\//, "");
        form.setValue(key as never, value as never, {
          shouldValidate: true,
          shouldDirty: true,
        });
        snapshotRef.current = setByJsonPointer(snapshotRef.current, path, value);
        listenersRef.current.forEach((l) => l());
      },

      update: (updates) => {
        let next = snapshotRef.current;
        Object.entries(updates).forEach(([path, value]) => {
          const key = path.replace(/^\//, "");
          form.setValue(key as never, value as never, {
            shouldValidate: true,
            shouldDirty: true,
          });
          next = setByJsonPointer(next, path, value);
        });
        snapshotRef.current = next;
        listenersRef.current.forEach((l) => l());
      },

      getSnapshot: () => snapshotRef.current,

      subscribe: (listener) => {
        listenersRef.current.add(listener);
        return () => listenersRef.current.delete(listener);
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return { store, form };
}
