export function setupImageUpload() {
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

    if (fileInput) {
      fileInput.addEventListener("change", () => {
        if (fileInput.files.length) {
          fileNameDisplay.textContent = fileInput.files[0].name;
          dropZone.classList.remove("invalid");
          document.getElementById("image-error").style.display = "none";
        }
      });
    }

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
}