export function setupMarkdownPreview() {
  const markdownTextarea = document.getElementById("post-content");
  const markdownPreview = document.getElementById("markdown-preview");
  const togglePreview = document.getElementById("togglePreview");

  function renderMarkdownPreview() {
    if (markdownTextarea && markdownPreview) {
      const rawHTML = marked.parse(markdownTextarea.value);
      markdownPreview.innerHTML = DOMPurify.sanitize(rawHTML);
    }
  }

  if (togglePreview && markdownTextarea && markdownPreview) {
    togglePreview.addEventListener("change", () => {
      markdownPreview.style.display = togglePreview.checked ? "block" : "none";
      if (togglePreview.checked) renderMarkdownPreview();
    });

    markdownTextarea.addEventListener("input", () => {
      if (togglePreview.checked) renderMarkdownPreview();
    });
  }

  if (!togglePreview && markdownTextarea && markdownPreview) {
    markdownTextarea.addEventListener("input", renderMarkdownPreview);
    renderMarkdownPreview();
  }
}