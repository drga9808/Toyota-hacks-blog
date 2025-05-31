//==================== Character Limit Logic ====================
function countCharacters(text) {
  return text.trim().length;
}

function limitTextarea(id, maxChars) {
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

limitTextarea("post-title", 60);
limitTextarea("post-description", 200);
limitTextarea("post-content", 2000);

//==================== Image Upload Drag & Drop ====================
const dropZone = document.getElementById("drop-zone");

if (dropZone) {
  const fileInput = document.getElementById("post-image");
  const fileNameDisplay = dropZone.querySelector(".file-name");
  const form = document.querySelector("form");

  dropZone.addEventListener("click", () => fileInput.click());

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");

    const files = e.dataTransfer.files;
    if (files.length) {
      fileInput.files = files;
      fileNameDisplay.textContent = files[0].name;
      dropZone.classList.remove("invalid");
      document.getElementById("image-error").style.display = "none";
    }
  });

  fileInput.addEventListener("change", () => {
    if (fileInput.files.length) {
      fileNameDisplay.textContent = fileInput.files[0].name;
      dropZone.classList.remove("invalid");
      document.getElementById("image-error").style.display = "none";
    }
  });

  // Only enforce image upload on create-post page
  if (window.location.pathname.includes("create-post")) {
    form.addEventListener("submit", (e) => {
      if (!fileInput.files || fileInput.files.length === 0) {
        e.preventDefault();
        document.getElementById("image-error").style.display = "block";
        dropZone.classList.add("invalid");
      }
    });
  }
}

//==================== Markdown Live Preview ====================
const markdownTextarea = document.getElementById("post-content");
const markdownPreview = document.getElementById("markdown-preview");
const togglePreview = document.getElementById("togglePreview");

function renderMarkdownPreview() {
  if (markdownTextarea && markdownPreview) {
    markdownPreview.innerHTML = marked.parse(markdownTextarea.value);
  }
}

// 1. If toggle exists (create page), conditionally render
if (togglePreview && markdownTextarea && markdownPreview) {
  togglePreview.addEventListener("change", () => {
    markdownPreview.style.display = togglePreview.checked ? "block" : "none";
    if (togglePreview.checked) renderMarkdownPreview();
  });

  markdownTextarea.addEventListener("input", () => {
    if (togglePreview.checked) renderMarkdownPreview();
  });
}

// 2. If no toggle (edit page), always render
if (!togglePreview && markdownTextarea && markdownPreview) {
  markdownTextarea.addEventListener("input", renderMarkdownPreview);
  renderMarkdownPreview(); // Initial load
}

//==================== Login - User validation  ====================


