//============================================================================================
//     ============================== Initial Setup ==============================
//============================================================================================
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import express from "express";
import multer from "multer";
import { fileURLToPath } from "url";
import { cloudinary, storage } from "./utils/cloudinary.js";

const app = express();
const port = 3000;

// Cloudinary configuration
dotenv.config();

// Just stores data in memory
const upload = multer({ storage });

// Get the current Directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// JSON path
const postsFilePath = path.join(__dirname, "views", "data", "posts.json");

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve Bootstrap
app.use(
  "/bootstrap",
  express.static(__dirname + "/node_modules/bootstrap/dist")
);

// Serve main.js
app.use("/scripts", express.static(path.join(__dirname, "public", "scripts")));

// Include folder containing the static files.
app.use(express.static("public"));

// Enable data parsing
app.use(express.urlencoded({ extended: true }));

app.listen(port, () => {
  console.log(`server started on port ${port}`);
});

//============================================================================================
//     ============================== Functions ==============================
//============================================================================================

// Load posts
function loadPosts() {
  try {
    const data = fs.readFileSync(postsFilePath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Failed to load posts:", err);
    return {};
  }
}

// Save posts
function savePosts(posts) {
  fs.writeFileSync(postsFilePath, JSON.stringify(posts, null, 2), "utf-8");
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function getUniqueSlug(title, posts) {
  let baseSlug = generateSlug(title);
  let slug = baseSlug;
  let counter = 1;

  while (posts[slug]) {
    slug = `${baseSlug}-${counter++}`;
  }

  return slug;
}

//============================================================================================
//     ============================== Load Posts Data ==============================
//============================================================================================

// In-memory posts object
let posts = loadPosts();

//============================================================================================
//     ============================== Routes - Pages ==============================
//============================================================================================

//********************** Get the main page **********************
app.get("/", (req, res) => {
  res.render("index", { posts });
});

//********************** Get a Specific Post **********************
app.get("/posts/:slug", (req, res) => {
  const slug = req.params.slug;
  const post = posts[slug];
  if (!post) return res.status(404).send("Post not found");
  res.render("post", { slug, post });
});

//********************** Create a post **********************
app.get("/create-post", (req, res) => {
  res.render("create-post");
});

//********************** Edit an existing post **********************
app.get("/post/edit/:slug", (req, res) => {
  const slug = req.params.slug;
  const post = posts[slug];
  if (!post) return res.status(404).send("post not found");

  res.render("edit-post", { slug, post });
});

//============================================================================================
//     ============================== Routes - Actions ==============================
//============================================================================================

//********************** Create a new post **********************
app.post("/create-post/publish-post", upload.single("image"), (req, res) => {
  const { title, category, readTime, description, content } = req.body;
  const slug = getUniqueSlug(title, posts);
  const date = new Date().toISOString().split("T")[0];

  const imageUrl = req.file?.path;
  const publicId = req.file?.filename;

  posts[slug] = {
    title,
    date,
    category,
    readTime,
    image: imageUrl,
    public_id: publicId,
    description,
    content,
  };

  savePosts(posts);
  res.redirect(`/posts/${slug}`);
});

//********************** Update existing post **********************
app.post("/edit-post/:slug", upload.single("image"), async (req, res) => {
  const slug = req.params.slug;
  if (!posts[slug]) return res.status(404).send("Post not found");

  const oldPublicId = posts[slug].public_id;

  // Handle new image upload
  let image = posts[slug].image;
  let public_id = oldPublicId;

  if (req.file) {
    // Delete old image from Cloudinary
    if (oldPublicId) await cloudinary.uploader.destroy(oldPublicId);

    // Update with new image
    image = req.file.path;
    public_id = req.file.filename;
  }

  posts[slug] = {
    title: req.body.title,
    date: req.body.date,
    category: req.body.category,
    readTime: req.body.readTime,
    image,
    public_id,
    description: req.body.description,
    content: req.body.content,
  };

  savePosts(posts);
  res.redirect(`/posts/${slug}`);
});

//********************** Delete an existing post **********************
app.post("/edit-post/delete-post/:slug", async (req, res) => {
  const slug = req.params.slug;

  if (!posts[slug]) return res.status(404).send("Post not found");

  const publicId = posts[slug].public_id;

  // Try deleting image from Cloudinary
  try {
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
      console.log(`Image ${publicId} deleted from Cloudinary`);
    }
  } catch (err) {
    console.error("Failed to delete image from Cloudinary:", err);
  }

  delete posts[slug];
  savePosts(posts);
  res.redirect("/");
});
