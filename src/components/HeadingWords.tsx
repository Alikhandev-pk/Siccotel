import { Children, cloneElement, isValidElement, type ReactNode } from "react";

/**
 * Server-rendered words retain the heading's text, IDs and accessible semantics.
 *
 * Each word is an inline-block so it can animate, and the space after it lives
 * inside the same span (kept by `white-space: pre`). A whitespace-only text node
 * between inline-blocks is dropped by some renderers, translators and capture
 * tools, which ran the words together; this way the space is never on its own.
 * Lines still wrap between the spans.
 */
export function HeadingWords({ children }: { children: ReactNode }) {
  return Children.map(children, (child) => {
    if (typeof child === "string") {
      const tokens = child.split(/(\s+)/).filter(Boolean);
      return tokens.map((token, i) => {
        if (/^\s+$/.test(token)) return i === 0 ? token : null; // already attached to the previous word
        const spaced = /^\s+$/.test(tokens[i + 1] ?? "") ? `${token} ` : token;
        return (
          <span key={i} data-motion-word="" className="inline-block whitespace-pre" suppressHydrationWarning>
            {spaced}
          </span>
        );
      });
    }
    if (isValidElement<{ children?: ReactNode }>(child) && child.props.children) {
      return cloneElement(child, {}, <HeadingWords>{child.props.children}</HeadingWords>);
    }
    return child;
  });
}
