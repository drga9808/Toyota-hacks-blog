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
        chars = maxChars;
      }
    });
  }
}

//******************************* Image Validation and Draggable *******************************

// Character limits
limitTextarea("post-title", 80);
limitTextarea("post-description", 200);
limitTextarea("post-content", 2000);

// Get DOM elements
const dropZone = document.getElementById("drop-zone");

if (dropZone) {
  const fileInput = document.getElementById("post-image");
  const fileNameDisplay = dropZone.querySelector(".file-name");
  const form = document.querySelector("form");

  // Click to open file dialog
  dropZone.addEventListener("click", () => fileInput.click());

  // Drag-and-drop handlers
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

  // Manual file selection
  fileInput.addEventListener("change", () => {
    if (fileInput.files.length) {
      fileNameDisplay.textContent = fileInput.files[0].name;
      dropZone.classList.remove("invalid");
      document.getElementById("image-error").style.display = "none";
    }
  });

  // Form submission validation
  // Only require image if on create-post page
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
