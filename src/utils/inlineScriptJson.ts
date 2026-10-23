const ESCAPES: [RegExp, string][] = [
  [/</g, '\\u003c'],
  [/>/g, '\\u003e'],
  [/&/g, '\\u0026'],
];

/** JSON that is safe to embed inside an inline <script> block (cannot close the element). */
export function serializeForInlineScript(value: unknown): string {
  return ESCAPES.reduce(
    (json, [pattern, escaped]) => json.replace(pattern, escaped),
    JSON.stringify(value),
  );
}
