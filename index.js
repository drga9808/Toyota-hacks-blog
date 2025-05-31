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
import { marked } from "marked";

const app = express();
const port = 3000;

// Load environment variables
dotenv.config();

// Configure Multer to use Cloudinary for image uploads
const upload = multer({ storage });

// Get the current directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to JSON files
const postsFilePath = path.join(__dirname, "views", "data", "posts.json");
const usersFilePath = path.join(__dirname, "views", "data", "users.json");

// View engine configuration
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve Bootstrap from node_modules
app.use(
  "/bootstrap",
  express.static(__dirname + "/node_modules/bootstrap/dist")
);

// Serve static JavaScript files
app.use("/scripts", express.static(path.join(__dirname, "public", "scripts")));

// Serve all other static files (images, styles, etc.)
app.use(express.static("public"));

// Enable form data parsing
app.use(express.urlencoded({ extended: true }));

// Start the server
app.listen(port, () => {
  console.log(`server started on port ${port}`);
});

//============================================================================================
//     ============================== Functions ==============================
//============================================================================================

// Load existing posts from JSON file
function loadPosts() {
  try {
    const data = fs.readFileSync(postsFilePath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Failed to load posts:", err);
    return {};
  }
}

// Save updated posts back to JSON file
function savePosts(posts) {
  fs.writeFileSync(postsFilePath, JSON.stringify(posts, null, 2), "utf-8");
}

// Generate URL-friendly slug from post title
function generateSlug(title) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

// Ensure slug is unique by appending a number if needed
function getUniqueSlug(title, posts) {
  let baseSlug = generateSlug(title);
  let slug = baseSlug;
  let counter = 1;

  while (posts[slug]) {
    slug = `${baseSlug}-${counter++}`;
  }

  return slug;
}

// Load existing users from JSON file
function loadUsers() {
  try {
    const data = fs.readFileSync(usersFilePath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Failed to load users:", err);
    return {};
  }
}

// Save updated users back to JSON file
function saveUsers(users) {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), "utf-8");
}

//============================================================================================
//     ============================== Load Data ==============================
//============================================================================================

let posts = loadPosts();
let users = loadUsers();

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

  // Convert Markdown content to HTML
  const htmlContent = marked.parse(post.content || "");

  res.render("post", { slug, post: { ...post, content: htmlContent } });
});

//********************** Create a post **********************
app.get("/create-post", (req, res) => {
  res.render("create-post");
});

//********************** Edit an existing post **********************
app.get("/post/edit/:slug", (req, res) => {
  const slug = req.params.slug;
  const post = posts[slug];
  if (!post) return res.status(404).send("Post not found");

  res.render("edit-post", { slug, post });
});

//********************** Open Login page **********************
app.get("/login", (req, res) => {
  res.render("login", { error: undefined });
});

//********************** Open Register page **********************
app.get("/register", (req, res) => {
  res.render("register");
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

    // Update with new image info
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

//********************** Validate login info **********************
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = users[email];

  if (user && user.password === password) {
    // Successful login
    res.redirect("/");
  } else {
    // Failed login — render with error
    res.render("login", { error: "Invalid email or password." });
  }
});

//********************** Register new user **********************
app.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  users[name] = {
    email,
    password,
  };

  saveUsers(users);

  res.redirect("/login");
});
