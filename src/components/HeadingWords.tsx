import { Children, cloneElement, isValidElement, type ReactNode } from "react";

/** Server-rendered words retain the heading's text, IDs and accessible semantics. */
export function HeadingWords({ children }: { children: ReactNode }) {
  return Children.map(children, (child) => {
    if (typeof child === "string") {
      return child.split(/(\s+)/).map((word, i) => /^\s+$/.test(word) ? word : (
        <span key={i} data-motion-word="" className="inline-block">{word}</span>
      ));
    }
    if (isValidElement<{ children?: ReactNode }>(child) && child.props.children) {
      return cloneElement(child, {}, <HeadingWords>{child.props.children}</HeadingWords>);
    }
    return child;
  });
}
