// localStorage xususiy rejimda yoki bloklanganda xato berishi mumkin — sayt baribir ishlashi kerak.
export function createStore(key, fallback) {
  return {
    load() {
      try {
        return JSON.parse(localStorage.getItem(key)) ?? fallback;
      } catch {
        return fallback;
      }
    },
    save(value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // Saqlab bo'lmasa, holat faqat shu sahifa ochiq turganda saqlanadi.
      }
    },
  };
}
