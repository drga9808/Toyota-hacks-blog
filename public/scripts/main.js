import { setupImageUpload } from "./upload.js";
import { setupMarkdownPreview } from "./markdown.js";
import { limitTextarea } from "./charLimit.js";

limitTextarea("post-title", 60);
limitTextarea("post-description", 200);
limitTextarea("post-content", 4000);

setupImageUpload();
setupMarkdownPreview();