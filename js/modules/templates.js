import { highlight } from "./highlight.js";

function optionsTemplate(question, tokens) {
  return Object.entries(question.o)
    .filter(([letter]) => letter !== question.a)
    .map(([, text]) => `<li class="card__option">${highlight(text, tokens)}</li>`)
    .join("");
}

function buttonTemplate({ label, modifier = "", data }) {
  const [name, value] = Object.entries(data)[0];
  const className = modifier ? `button button--${modifier}` : "button";
  return `<button class="${className}" type="button" data-${name}="${value}">${label}</button>`;
}

export function cardTemplate(question, tokens, isFound) {
  return `
    <article class="card${isFound ? " card--found" : ""}">
      <span class="card__tag">${question.part}-qism · ${question.n}</span>
      <p class="card__question">${highlight(question.q, tokens)}</p>
      <div class="card__answer">
        <span class="card__answer-label">✅ To‘g‘ri javob</span>
        ${highlight(question.answer, tokens)}
      </div>
      <ul class="card__options">${optionsTemplate(question, tokens)}</ul>
      <div class="card__actions">
        ${buttonTemplate({
          label: isFound ? "✓ Topildi" : "Topildi deb belgilash",
          modifier: isFound ? "done" : "",
          data: { found: question.id },
        })}
        ${buttonTemplate({ label: "🖼 Asl rasm", data: { image: question.img } })}
      </div>
    </article>`;
}

export const noteTemplate = (text) => `<p class="results__note">${text}</p>`;

export const emptyTemplate = (text) => `<div class="results__empty">${text}</div>`;
