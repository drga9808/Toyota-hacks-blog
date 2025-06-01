import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  title: String,
  slug: String,
  category: String,
  readTime: String,
  description: String,
  content: String,
  image: String,
  public_id: String,
  createdBy: String,
  date: String,
});

export default mongoose.model("Post", postSchema);