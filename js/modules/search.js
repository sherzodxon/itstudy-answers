import { normalize } from "./normalize.js";

const MAX_APPROXIMATE_RESULTS = 5;
const SCORE = { exact: 1, prefix: 0.6, typo: 0.5 };

function levenshtein(a, b) {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);

  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
    }
    prev = cur;
  }

  return prev[b.length];
}

function matchesPrefix(token, words) {
  const prefix = token.slice(0, Math.max(3, token.length - 2));
  return words.some((word) => word.startsWith(prefix));
}

// Imlo xatosi: so'z boshi bilan 1–2 harf farq qilsa ham mos deb hisoblanadi.
function matchesWithTypo(token, words) {
  const maxDistance = token.length >= 8 ? 2 : 1;
  return words.some((word) =>
    [token.length, token.length + 1].some(
      (length) => levenshtein(token, word.slice(0, length)) <= maxDistance,
    ),
  );
}

function scoreToken(token, { haystack, words }) {
  if (haystack.includes(token)) return SCORE.exact;
  if (token.length < 4) return 0;
  if (matchesPrefix(token, words)) return SCORE.prefix;
  if (matchesWithTypo(token, words)) return SCORE.typo;
  return 0;
}

function scoreQuestion(question, tokens) {
  const scores = tokens.map((token) => scoreToken(token, question.index));
  return {
    question,
    isExact: scores.every((score) => score === SCORE.exact),
    total: scores.reduce((sum, score) => sum + score, 0),
  };
}

/** Har bir savolga qidiruv indeksi va to'g'ri javob matnini qo'shadi. */
export function prepareQuestions(questions) {
  return questions.map((question) => {
    const haystack = normalize([question.q, ...Object.values(question.o)].join(" "));
    return {
      ...question,
      id: `${question.part}-${question.n}`,
      answer: question.o[question.a],
      index: { haystack, words: haystack.split(" ") },
    };
  });
}

/**
 * Avval barcha so'zlar aniq mos kelgan savollar qaytariladi;
 * bunday savol bo'lmasa — eng yaqin (taxminiy) natijalar.
 */
export function searchQuestions(questions, tokens) {
  if (!tokens.length) return { items: questions, isApproximate: false };

  const scored = questions.map((question) => scoreQuestion(question, tokens));
  const exact = scored.filter((result) => result.isExact);

  if (exact.length) {
    return { items: exact.map((result) => result.question), isApproximate: false };
  }

  const approximate = scored
    .filter((result) => result.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, MAX_APPROXIMATE_RESULTS)
    .map((result) => result.question);

  return { items: approximate, isApproximate: true };
}
