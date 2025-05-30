import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { posts } from "./views/data/posts.js";
import { title } from "process";

const app = express();
const port = 3000;

// Get the current Directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve Bootstrap
app.use(
  "/bootstrap",
  express.static(__dirname + "/node_modules/bootstrap/dist")
);

// Include folder containing the static files.
app.use(express.static("public"));

// Enable data parsing
app.use(express.urlencoded({ extended: true }));

app.listen(port, () => {
  console.log(`server started on port ${port}`);
});

// Main Page
app.get("/", (req, res) => {
  res.render("index", { posts });
});

// Route to render a specific post
app.get("/posts/:slug", (req, res) => {
  const slug = req.params.slug;
  const post = posts[slug]; // access object by key

  if (!post) return res.status(404).send("Post not found");

  res.render("post", { post }); // render post.ejs with the post data
});

// Route to read an exisiting post
app.post("/post/:slug", (req, res) => {
  const slug = req.params.slug;
  const post = posts[slug];
  if(!post) return res.status(404).send("post not found");
  res.render("post", {slug, post});
});

// Route to post creation page
app.get("/create-post", (req, res) => {
  res.render("create-post");
});

// Route to publish a new post
app.post("/create-post/publish-post", (req, res) => {
  res.render("index", { posts });
});

// Route to edit an exisiting post
app.post("/post/edit/:slug", (req, res) => {
  const slug = req.params.slug;
  const post = posts[slug];
  if(!post) return res.status(404).send("post not found");

  res.render("edit-post", {slug, post});
});

// Update the exisiting post with the new content
app.post("/edit-post/:slug", (req, res) => {
  const slug = req.params.slug;
  if (!posts[slug]) return res.status(404).send("Post not found");

  // Update the post
  posts[slug] = {
    title: req.body.title,
    date: req.body.date,
    category: req.body.category,
    readTime: req.body.readTime,
    image: req.body.image,
    description: req.body.description,
    content: req.body.content,
  };

  res.redirect(`/posts/${slug}`);
});

// Route to delete an exisiting post
app.post("/edit-post/delete-post/:slug", (req, res) => {
  const slug = req.params.slug;
  delete posts[slug]; // In memory deletion
  res.redirect("/"); 
});
