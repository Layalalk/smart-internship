require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const session = require("express-session");
const multer = require("multer");
const OpenAI = require("openai");

const app = express();
const PORT = process.env.PORT || 10000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "internship-secret",
    resave: false,
    saveUninitialized: false
  })
);

// MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB error:", err));

// Static files
app.use(express.static(path.join(__dirname, "HTML")));
app.use("/css", express.static(path.join(__dirname, "CSS")));
app.use("/js", express.static(path.join(__dirname, "JS")));
app.use("/images", express.static(path.join(__dirname, "images")));

// Home route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "HTML", "index.html"));
});

// Example schema
const contactSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  gender: String,
  mobile: String,
  dob: String,
  email: String,
  language: String
});

const Contact = mongoose.model("Contact", contactSchema);

// Example route
app.post("/contact", async (req, res) => {
  try {
    const newContact = new Contact(req.body);
    await newContact.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
