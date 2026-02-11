# 🧰 Toyota Hacks Blog

A full-stack blog application built for Toyota enthusiasts to share repair tips, maintenance advice, and custom guides.

---

## 🚀 Features

- 📝 Create, edit, and delete blog posts (Markdown supported)
- 📷 Upload and manage images with Cloudinary
- 🔐 User login and registration
- 🔒 Session-based authentication with Express-session
- 🗃️ MongoDB used for post and user data
- 🧪 Demo account to test functionality
- 🎨 Clean UI with Bootstrap

---

## 🛠️ Technologies Used

- Node.js + Express (Backend)
- EJS (Templating Engine)
- MongoDB + Mongoose (Database)
- Cloudinary (Image uploads)
- Bootstrap (Styling)
- Express-session (Authentication)
- Fly.io (Deployment)
- GitHub (Version control)

---

## 📁 Project Structure

```
toyota-blog/
├── public/               # Static assets (CSS, JS, images)
├── views/                # EJS templates
│   ├── partials/         # Reusable header/footer
├── routes/               # Express route files
├── models/               # Mongoose schemas for MongoDB
├── cloudinary.js         # Cloudinary config
├── app.js                # Main server file
├── .env                  # Environment variables (Mongo URI, etc.)
```

---

## 📦 Getting Started

1. Clone the repository:
```bash
git clone https://github.com/your-username/toyota-hacks-blog.git
cd toyota-hacks-blog
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file and add:
```
MONGODB_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
SESSION_SECRET=your_session_secret
```

4. Start the server:
```bash
node app.js
```

5. Visit `http://localhost:3000` in your browser.

---

## ✅ Demo Account

Use the demo credentials on the login page to explore the site.

---

## 🧼 Live Site

Visit: [Toyota Hacks Blog](https://toyota-blog.drga98.com)
