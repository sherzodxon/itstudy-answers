import { QUESTIONS } from "./modules/questions.js";
import { tokenize } from "./modules/normalize.js";
import { prepareQuestions, searchQuestions } from "./modules/search.js";
import { createStore } from "./modules/storage.js";
import { cardTemplate, noteTemplate, emptyTemplate } from "./modules/templates.js";
import { createLightbox } from "./modules/lightbox.js";

const TEXT = {
  approximate: "Aniq moslik yo‘q — eng yaqin natijalar:",
  empty: "Hech narsa topilmadi. Boshqa so‘z bilan urinib ko‘ring.",
  confirmReset: "Barcha “topildi” belgilarini o‘chirasizmi?",
  progress: (found, total) => `Topildi: ${found} / ${total}`,
};
const CHIP_ACTIVE = "chip--active";

const questions = prepareQuestions(QUESTIONS);
const foundStore = createStore("topilgan-v1", {});

const state = {
  part: 0, // 0 — hammasi
  hideFound: false,
  found: foundStore.load(),
};

const el = {
  input: document.querySelector(".search__input"),
  clear: document.querySelector(".search__clear"),
  progress: document.querySelector(".header__progress"),
  partChips: document.querySelectorAll("[data-part]"),
  hideFound: document.querySelector("[data-action='hide-found']"),
  reset: document.querySelector("[data-action='reset']"),
  list: document.querySelector(".results__list"),
};

const lightbox = createLightbox(document.querySelector(".lightbox"));

const isFound = (id) => Boolean(state.found[id]);

function visibleQuestions() {
  return questions.filter(
    (question) =>
      (!state.part || question.part === state.part) && !(state.hideFound && isFound(question.id)),
  );
}

function renderList(items, tokens, isApproximate) {
  if (!items.length) {
    el.list.innerHTML = emptyTemplate(TEXT.empty);
    return;
  }

  const note = isApproximate ? noteTemplate(TEXT.approximate) : "";
  const cards = items.map((question) => cardTemplate(question, tokens, isFound(question.id)));
  el.list.innerHTML = note + cards.join("");
}

function render() {
  const tokens = tokenize(el.input.value);
  const { items, isApproximate } = searchQuestions(visibleQuestions(), tokens);

  el.clear.hidden = !el.input.value;
  el.progress.textContent = TEXT.progress(Object.keys(state.found).length, questions.length);
  renderList(items, tokens, isApproximate);
}

function setQuery(value) {
  el.input.value = value;
  render();
  el.input.focus();
}

function setFound(found) {
  state.found = found;
  foundStore.save(found);
}

function toggleFound(id) {
  const { [id]: wasFound, ...rest } = state.found;
  setFound(wasFound ? rest : { ...state.found, [id]: true });

  // Belgilangandan so'ng keyingi savolni qidirish uchun maydon tozalanadi.
  if (wasFound) render();
  else setQuery("");
}

function selectPart(chip) {
  state.part = Number(chip.dataset.part);
  el.partChips.forEach((item) => item.classList.toggle(CHIP_ACTIVE, item === chip));
  render();
}

function onListClick(event) {
  const button = event.target.closest("button");
  if (!button) return;

  const { found, image } = button.dataset;
  if (found) toggleFound(found);
  if (image) lightbox.open(image);
}

function onKeydown(event) {
  if (event.key === "Escape") {
    if (lightbox.isOpen()) lightbox.close();
    else setQuery("");
  }

  if (event.key === "/" && document.activeElement !== el.input) {
    event.preventDefault();
    el.input.focus();
  }
}

el.input.addEventListener("input", render);
el.clear.addEventListener("click", () => setQuery(""));
el.partChips.forEach((chip) => chip.addEventListener("click", () => selectPart(chip)));
el.hideFound.addEventListener("click", () => {
  state.hideFound = !state.hideFound;
  el.hideFound.classList.toggle(CHIP_ACTIVE, state.hideFound);
  render();
});
el.reset.addEventListener("click", () => {
  if (!confirm(TEXT.confirmReset)) return;
  setFound({});
  render();
});
el.list.addEventListener("click", onListClick);
document.addEventListener("keydown", onKeydown);

render();
