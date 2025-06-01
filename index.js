//============================================================================================
//     ============================== Initial Setup ==============================
//============================================================================================
import session from "express-session";
import dotenv from "dotenv";
import path from "path";
import express from "express";
import multer from "multer";
import mongoose from "mongoose";
import MongoStore from "connect-mongo";
import { fileURLToPath } from "url";
import { cloudinary, storage } from "./utils/cloudinary.js";
import { marked } from "marked";
import { generateSlug } from "./utils/slug.js";
import { demoPostSlug, demoPostOriginal } from "./views/data/demoPost.js";

// Database
import User from "./models/User.js";
import Post from "./models/Post.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Configure Multer to use Cloudinary for image uploads
const upload = multer({ storage });

// Get the current directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// View engine configuration
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files
app.use(
  "/bootstrap",
  express.static(__dirname + "/node_modules/bootstrap/dist")
);
app.use("/scripts", express.static(path.join(__dirname, "public", "scripts")));
app.use(express.static("public"));

// Enable form data parsing
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.set("trust proxy", 1); // required when using Fly.io/Cloudflare
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
    }),
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

//============================================================================================
//     ============================== Placeholder Routes ==============================
//============================================================================================

// These still rely on local `posts` and `users` variables
// We will update them one-by-one in the next steps

// Example:
app.get("/", async (req, res) => {
  const currentUser = req.session.user;

  try {
    const posts = await Post.find().sort({ date: -1 });
    const users = await User.find();

    res.render("index", { posts, currentUser, users });
  } catch (error) {
    console.error("Failed to fetch data:", error);
    res.status(500).send("Internal Server Error");
  }
});

//============================================================================================
//     ============================== Start Server ==============================
//============================================================================================

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});

//============================================================================================
//     ============================== Ensure Demo Post Exists ==============================
//============================================================================================
async function ensureDemoPostExists() {
  const exists = await Post.findOne({ slug: demoPostSlug });
  if (!exists) {
    await Post.create(demoPostOriginal);
    console.log("✅ Demo post created");
  } else {
    console.log("ℹ️ Demo post already exists");
  }
}

ensureDemoPostExists();

//============================================================================================
//     ============================== Routes - Pages ==============================
//============================================================================================

//********************** Get the main page **********************
app.get("/", async (req, res) => {
  console.log("Current session user:", req.session.user); // ✅ debug
  
  const currentUser = req.session.user;

  try {
    const posts = await Post.find().sort({ date: -1 });
    const users = await User.find();

    res.render("index", { posts, currentUser, users });
  } catch (error) {
    console.error("Failed to fetch data:", error);
    res.status(500).send("Internal Server Error");
  }
});

//********************** Get a Specific Post **********************
app.get("/posts/:slug", async (req, res) => {
  const slug = req.params.slug;
  const currentUser = req.session.user;

  try {
    const post = await Post.findOne({ slug });
    const users = await User.find();

    if (!post) return res.status(404).send("Post not found");

    // Convert Markdown content to HTML
    const htmlContent = marked.parse(post.content || "");

    res.render("post", {
      slug,
      post: { ...post.toObject(), content: htmlContent },
      currentUser,
      users,
    });
  } catch (error) {
    console.error("Failed to load post:", error);
    res.status(500).send("Internal Server Error");
  }
});

//********************** Create a post **********************
app.get("/create-post", async (req, res) => {
  if (!req.session.user) {
    req.session.redirectAfterLogin = "/create-post";
    return res.redirect("/login");
  }

  const users = await User.find();
  res.render("create-post", {
    currentUser: req.session.user,
    users,
  });
});

//********************** Edit an existing post **********************
app.get("/post/edit/:slug", async (req, res) => {
  const slug = req.params.slug;
  const currentUser = req.session.user;

  try {
    const post = await Post.findOne({ slug });
    const users = await User.find();

    if (!post) return res.status(404).send("Post not found");
    if (!currentUser || post.createdBy !== currentUser) {
      return res.status(403).send("Unauthorized");
    }

    res.render("edit-post", { post, slug, currentUser, users });
  } catch (err) {
    console.error("Edit page error:", err);
    res.status(500).send("Internal Server Error");
  }
});

//********************** Open Login page **********************
app.get("/login", async (req, res) => {
  const users = await User.find();

  res.render("login", {
    error: undefined,
    currentUser: req.session.user,
    users,
  });
});

//********************** Open Register page **********************
app.get("/register", async (req, res) => {
  const users = await User.find();

  res.render("register", {
    currentUser: req.session.user,
    users,
  });
});

//============================================================================================
//     ============================== Routes - Actions ==============================
//============================================================================================

//********************** Create a new post **********************
app.post(
  "/create-post/publish-post",
  upload.single("image"),
  async (req, res) => {
    if (!req.session.user) return res.redirect("/login");

    const { title, category, readTime, description, content } = req.body;

    try {
      // Generate base slug
      const baseSlug = generateSlug(title);
      let slug = baseSlug;
      let counter = 1;

      // Ensure slug is unique
      while (await Post.findOne({ slug })) {
        slug = `${baseSlug}-${counter++}`;
      }

      const imageUrl = req.file?.path;
      const publicId = req.file?.filename;
      const date = new Date().toISOString().split("T")[0];

      await Post.create({
        title,
        slug,
        date,
        createdBy: req.session.user,
        category,
        readTime,
        image: imageUrl,
        public_id: publicId,
        description,
        content,
      });

      res.redirect(`/posts/${slug}`);
    } catch (err) {
      console.error("Failed to create post:", err);
      res.status(500).send("Internal Server Error");
    }
  }
);

//********************** Update existing post **********************
app.post("/edit-post/:slug", upload.single("image"), async (req, res) => {
  const slug = req.params.slug;
  const currentUser = req.session.user;
  const date = new Date().toISOString().split("T")[0];

  try {
    const post = await Post.findOne({ slug });
    if (!post) return res.status(404).send("Post not found");

    if (!currentUser || post.createdBy !== currentUser) {
      return res.status(403).send("Unauthorized");
    }

    let image = post.image;
    let public_id = post.public_id;

    // Handle new image upload
    if (req.file) {
      if (post.public_id) {
        try {
          await cloudinary.uploader.destroy(post.public_id);
        } catch (err) {
          console.error("Cloudinary delete error:", err);
        }
      }

      image = req.file.path;
      public_id = req.file.filename;
    }

    await Post.updateOne(
      { slug },
      {
        $set: {
          title: req.body.title,
          date,
          category: req.body.category,
          readTime: req.body.readTime,
          image,
          public_id,
          description: req.body.description,
          content: req.body.content,
        },
      }
    );

    res.redirect(`/posts/${slug}`);
  } catch (err) {
    console.error("Failed to update post:", err);
    res.status(500).send("Internal Server Error");
  }
});

//********************** Delete an existing post **********************
app.post("/edit-post/delete-post/:slug", async (req, res) => {
  const slug = req.params.slug;
  const currentUser = req.session.user;

  try {
    const post = await Post.findOne({ slug });

    if (!post) return res.status(404).send("Post not found");

    if (!currentUser || post.createdBy !== currentUser) {
      return res.status(403).send("Unauthorized");
    }

    const publicId = post.public_id;

    // Try deleting image from Cloudinary
    try {
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
        console.log(`🗑️ Image ${publicId} deleted from Cloudinary`);
      }
    } catch (err) {
      console.error("Failed to delete image from Cloudinary:", err);
    }

    await Post.deleteOne({ slug });
    res.redirect("/");
  } catch (err) {
    console.error("Failed to delete post:", err);
    res.status(500).send("Internal Server Error");
  }
});

//********************** Validate login info **********************
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    const users = await User.find();

    if (user && user.password === password) {
      req.session.user = email;

      const redirectTo = req.session.redirectAfterLogin || "/";
      delete req.session.redirectAfterLogin;

      return res.redirect(redirectTo);
    } else {
      res.render("login", {
        error: "Invalid email or password.",
        currentUser: req.session.user,
        users,
      });
    }
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).send("Internal Server Error");
  }
});

//********************** Register new user **********************
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const users = await User.find();
      return res.render("register", {
        currentUser: req.session.user,
        users,
        error: "User already exists.",
      });
    }

    await User.create({ name, email, password });
    res.redirect("/login");
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).send("Internal Server Error");
  }
});

//********************** Logout **********************
app.get("/logout", async (req, res) => {
  try {
    await Post.findOneAndUpdate({ slug: demoPostSlug }, demoPostOriginal, {
      upsert: true,
    });
  } catch (err) {
    console.error("Failed to restore demo post:", err);
  }

  req.session.destroy(() => {
    res.redirect("/login");
  });
});
