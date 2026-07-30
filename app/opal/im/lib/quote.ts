<<<<<<< HEAD
import type { IMMessage } from "./types";

/**
 * Format a message as a markdown blockquote suitable for prepending to a
 * reply. Renders inline in the bubble via the existing MarkdownContent.
 */
export function formatQuoteMarkdown(
  quoted: IMMessage,
  profiles: Record<string, string>,
): string {
  const author = profiles[quoted.sender_id] ?? quoted.sender_id;
  const body =
    quoted.content.length > 200
      ? quoted.content.slice(0, 200).trimEnd() + "…"
      : quoted.content;
  const quoteLines = body
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n");
  return `> **${author}**\n${quoteLines}\n\n`;
}
=======
import type { IMMessage } from "./types";

/**
 * Format a message as a markdown blockquote suitable for prepending to a
 * reply. Renders inline in the bubble via the existing MarkdownContent.
 */
export function formatQuoteMarkdown(
  quoted: IMMessage,
  profiles: Record<string, string>,
): string {
  const author = profiles[quoted.sender_id] ?? quoted.sender_id;
  const body =
    quoted.content.length > 200
      ? quoted.content.slice(0, 200).trimEnd() + "…"
      : quoted.content;
  const quoteLines = body
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n");
  return `> **${author}**\n${quoteLines}\n\n`;
}
>>>>>>> origin/main
