// Kirill harflarini lotinga o'girish jadvali (o'quvchi kirillda yozsa ham topilsin).
const CYRILLIC_TO_LATIN = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "j", з: "z", и: "i",
  й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t",
  у: "u", ф: "f", х: "x", ц: "ts", ч: "ch", ш: "sh", щ: "sh", ъ: "", ы: "i", ь: "",
  э: "e", ю: "yu", я: "ya", ў: "o", қ: "q", ғ: "g", ҳ: "h",
};

const CYRILLIC_RE = /[а-яёўқғҳ]/g;
const APOSTROPHES_RE = /['‘’ʻʼ`´]/g;
const NON_WORD_RE = /[^a-z0-9$]+/g;

/**
 * Matnni qidiruv uchun bir xil ko'rinishga keltiradi:
 * kichik harf, kirill -> lotin, apostroflar olib tashlanadi (o‘ / o' / oʻ -> o).
 */
export function normalize(text) {
  return text
    .toLowerCase()
    .replace(CYRILLIC_RE, (char) => CYRILLIC_TO_LATIN[char] ?? char)
    .replace(APOSTROPHES_RE, "")
    .replace(NON_WORD_RE, " ")
    .trim();
}

export function tokenize(text) {
  return normalize(text).split(" ").filter(Boolean);
}
