function countCharacters(text) {
  return text.trim().length;
}

export function limitTextarea(id, maxChars) {
  const textarea = document.getElementById(id);
  if (textarea) {
    textarea.addEventListener("input", () => {
      let chars = countCharacters(textarea.value);
      if (chars > maxChars) {
        textarea.value = textarea.value.trim().slice(0, maxChars);
      }
    });
  }
}