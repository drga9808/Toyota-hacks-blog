//============================================================================================
//     ============================== Initial Setup ==============================
//============================================================================================
import session from "express-session";
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

// Handle different sessions for different users
app.use(
  session({
    secret: "keyboard cat", // change this in production
    resave: false,
    saveUninitialized: true,
  })
);

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

// Demo Post (Is not altered after user's session is finished)
const demoPostSlug = "test-post-example";

const demoPostOriginal = {
  title: "How to Test Edit and Delete Features",
  date: "2025-05-31",
  createdBy: "test@toyotahacksblog.com",
  category: "Test",
  readTime: "1 min read",
  image:
    "https://res.cloudinary.com/dcco4yq4l/image/upload/v1748489999/sample-image.png",
  description:
    "This is a test post to try editing and deleting. Use it to experiment safely.",
  content:
    "Welcome to the Toyota Hacks Blog demo account!\n\nThis post was created for test purposes.\n\n- Try editing the title or text.\n- Then delete it to see how it works.\n\nIf something breaks, you can always recreate this post. 🚀",
};

// Reset the post at server startup
posts[demoPostSlug] = demoPostOriginal;
savePosts(posts);

//============================================================================================
//     ============================== Routes - Pages ==============================
//============================================================================================

//********************** Get the main page **********************
app.get("/", (req, res) => {
  const currentUser = req.session.user;
  res.render("index", { posts, currentUser, users });
});

//********************** Get a Specific Post **********************
app.get("/posts/:slug", (req, res) => {
  const slug = req.params.slug;
  const post = posts[slug];
  const currentUser = req.session.user;
  if (!post) return res.status(404).send("Post not found");

  // Convert Markdown content to HTML
  const htmlContent = marked.parse(post.content || "");

  res.render("post", {
    slug,
    post: { ...post, content: htmlContent },
    currentUser,
    users,
  });
});

//********************** Create a post **********************
app.get("/create-post", (req, res) => {
  if (!req.session.user) {
    req.session.redirectAfterLogin = "/create-post";
    return res.redirect("/login");
  }

  res.render("create-post", { currentUser: req.session.user, users });
});

//********************** Edit an existing post **********************
app.get("/post/edit/:slug", (req, res) => {
  const slug = req.params.slug;
  const post = posts[slug];
  const currentUser = req.session.user;

  if (!post) return res.status(404).send("Post not found");
  if (!currentUser || post.createdBy !== currentUser) {
    return res.status(403).send("Unauthorized");
  }

  res.render("edit-post", { post, slug, currentUser, users });
});

//********************** Open Login page **********************
app.get("/login", (req, res) => {
  res.render("login", {
    error: undefined,
    currentUser: req.session.user,
    users,
  });
});

//********************** Open Register page **********************
app.get("/register", (req, res) => {
  res.render("register", { currentUser: req.session.user, users });
});

//============================================================================================
//     ============================== Routes - Actions ==============================
//============================================================================================

//********************** Create a new post **********************
app.post("/create-post/publish-post", upload.single("image"), (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  const { title, category, readTime, description, content } = req.body;
  const slug = getUniqueSlug(title, posts);
  const date = new Date().toISOString().split("T")[0];

  const imageUrl = req.file?.path;
  const publicId = req.file?.filename;

  posts[slug] = {
    title,
    date,
    createdBy: req.session.user,
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
  const currentUser = req.session.user;
  const post = posts[slug];
  const date = new Date().toISOString().split("T")[0];

  if (!post) return res.status(404).send("Post not found");

  if (!currentUser || post.createdBy !== currentUser) {
    return res.status(403).send("Unauthorized");
  }

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
    ...post,
    title: req.body.title,
    date,
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
  const currentUser = req.session.user;
  const post = posts[slug];

  if (!post) return res.status(404).send("Post not found");

  if (!currentUser || post.createdBy !== currentUser) {
    return res.status(403).send("Unauthorized");
  }

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
    req.session.user = email;

    // Redirect to the saved page (if any), or default to "/"
    const redirectTo = req.session.redirectAfterLogin || "/";
    delete req.session.redirectAfterLogin;

    return res.redirect(redirectTo);
  } else {
    // Failed login — render with error
    res.render("login", {
      error: "Invalid email or password.",
      currentUser: req.session.user,
      users,
    });
  }
});

//********************** Register new user **********************
app.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  users[email] = {
    name,
    password,
  };

  saveUsers(users);

  res.redirect("/login");
});

//********************** Logout **********************
app.get("/logout", (req, res) => {
  // Restore demo post
  posts[demoPostSlug] = demoPostOriginal;
  savePosts(posts);

  req.session.destroy(() => {
    res.redirect("/login");
  });
});
