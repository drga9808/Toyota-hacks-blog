import express from "express";
import path from "path";
import { fileURLToPath } from "url";

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

app.listen(port, () => {
  console.log(`server started on port ${port}`);
});

// Posts Data
const posts = {
  // Toyota Original Parts
  "toyota-original-parts": {
    title: "Toyota Original Parts",
    date: "May 2025",
    category: "Parts",
    readTime: "3 min read",
    image:
      "https://res.cloudinary.com/dcco4yq4l/image/upload/v1748372263/parts.png",
    description:
      "Toyota original parts have no equal. People usually associate original parts with EXPENSIVE DEALERSHIPS…",
    content: `
        <p>Original Toyota parts are specifically designed to fit and function perfectly in your vehicle.</p>
        <p>While many people associate OEM parts with dealerships and high prices, there are alternative ways to source them.</p>
        <h3>What makes a part OEM?</h3>
        <p>The part is manufactured by or for Toyota and meets all factory standards.</p>
      `,
  },

  // Toyota Brakes
  "toyota-brakes": {
    title: "Toyota Brakes",
    date: "May 2025",
    category: "Parts",
    readTime: "3 min read",
    image:
      "https://res.cloudinary.com/dcco4yq4l/image/upload/v1748372263/parts.png",
    description:
      "Toyota original parts have no equal. People usually associate original parts with EXPENSIVE DEALERSHIPS…",
    content: `
        <p>Original Toyota parts are specifically designed to fit and function perfectly in your vehicle.</p>
        <p>While many people associate OEM parts with dealerships and high prices, there are alternative ways to source them.</p>
        <h3>What makes a part OEM?</h3>
        <p>The part is manufactured by or for Toyota and meets all factory standards.</p>
      `,
  },
};

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
