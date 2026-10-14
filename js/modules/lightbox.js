const OPEN_CLASS = "lightbox--open";

export function createLightbox(root) {
  const image = root.querySelector(".lightbox__image");

  const lightbox = {
    open(src) {
      image.src = src;
      root.classList.add(OPEN_CLASS);
    },
    close() {
      root.classList.remove(OPEN_CLASS);
    },
    isOpen() {
      return root.classList.contains(OPEN_CLASS);
    },
  };

  root.addEventListener("click", lightbox.close);
  return lightbox;
}
