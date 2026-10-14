import { normalize } from "./normalize.js";

const HTML_ENTITIES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
const MIN_PARTIAL_LENGTH = 3;

export function escapeHtml(text) {
  return text.replace(/[&<>"]/g, (char) => HTML_ENTITIES[char]);
}

function isMatch(word, tokens) {
  const normalized = normalize(word);
  if (!normalized) return false;

  return tokens.some(
    (token) =>
      normalized.includes(token) ||
      (normalized.length >= MIN_PARTIAL_LENGTH && token.includes(normalized)),
  );
}

/** Qidirilgan so'zlarni <mark> bilan ajratib, xavfsiz HTML qaytaradi. */
export function highlight(text, tokens) {
  if (!tokens.length) return escapeHtml(text);

  return text
    .split(/(\s+)/)
    .map((part) =>
      isMatch(part, tokens) ? `<mark class="highlight">${escapeHtml(part)}</mark>` : escapeHtml(part),
    )
    .join("");
}
