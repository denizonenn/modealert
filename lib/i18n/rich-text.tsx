import type { ReactNode } from "react";

// Splits on **bold** markers so legal/policy copy can keep its inline
// emphasis (a term, a UI label) without hardcoding it outside the
// translated string per locale — the dictionary owns the whole
// sentence, markers and all.
export function withBold(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <span key={index} className="text-white">
        {part.slice(2, -2)}
      </span>
    ) : (
      part
    )
  );
}
