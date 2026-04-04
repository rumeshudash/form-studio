"use client";

import { useEffect, useState } from "react";

interface SchemaViewerProps {
  code: string | null;
}

async function highlight(code: string): Promise<string> {
  const { getSingletonHighlighter } = await import("shiki");
  const hl = await getSingletonHighlighter({
    langs: ["json"],
    themes: ["github-light", "github-dark"],
  });
  return hl.codeToHtml(code, {
    lang: "json",
    themes: {
      light: "github-light",
      dark: "github-dark",
    },
  });
}

export function SchemaViewer({ code }: SchemaViewerProps) {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    if (!code) {
      setHtml(null);
      return;
    }
    let cancelled = false;
    highlight(code).then((result) => {
      if (!cancelled) setHtml(result);
    });
    return () => {
      cancelled = true;
    };
  }, [code]);

  if (!code) {
    return (
      <p className="p-4 text-[11px] font-mono text-muted-foreground/60 italic">
        Add fields to see the schema…
      </p>
    );
  }

  if (!html) {
    return (
      <pre className="p-4 text-[11px] leading-relaxed font-mono text-foreground/80 whitespace-pre-wrap">
        {code}
      </pre>
    );
  }

  return (
    <div className="schema-viewer p-4 overflow-auto" dangerouslySetInnerHTML={{ __html: html }} />
  );
}
