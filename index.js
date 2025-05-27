import express from "express";
import path from "path";
import { fileURLToPath } from 'url';

const app = express();
const port = 3000;

// Get the current Directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve Bootstrap
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'));

// Include folder containing the static files.
app.use(express.static("public"));

app.listen(port, () => {
    console.log(`server started on port ${port}`)
}) ;

// Main Page
app.get("/", (req, res) => {
    res.render("index.ejs");
});