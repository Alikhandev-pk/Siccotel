export type BodyBlock = { text: string } | { list: string[] } | { quote: string };

/** Article body format: blank lines separate blocks; "- " lines form a list; a "> " block is a quotation. */
export function parseBody(body: string): BodyBlock[] {
  return body
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split("\n").map((l) => l.trim());
      if (lines.every((l) => l.startsWith("- "))) return { list: lines.map((l) => l.slice(2)) };
      if (block.startsWith("> ")) return { quote: block.slice(2).replace(/\n> ?/g, " ") };
      return { text: lines.join(" ") };
    });
}
