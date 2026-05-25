require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const session = require("express-session");
const multer = require("multer");
const fs = require("fs");
const OpenAI = require("openai");

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const app = express();

let openai = null;

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});

const upload = multer({ storage });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "change-this-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false
    }
  })
);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB error:", err));

const contactSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  gender: { type: String, required: true },
  mobile: { type: String, required: true, trim: true },
  dob: { type: String, required: true },
  email: { type: String, required: true, trim: true },
  language: { type: String, required: true },
  category: { type: String, required: true },
  message: { type: String, required: true, trim: true }
});

const Contact = mongoose.model("Contact", contactSchema);

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true }
});

const User = mongoose.model("User", userSchema);

/* Static files - all files are in the root folder */
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/contact", async (req, res) => {
  try {
    const newContact = new Contact(req.body);
    await newContact.save();

    console.log("Saved contact to DB");

    res.json({
      message: "تم حفظ البيانات في الداتابيس "
    });
  } catch (error) {
    console.log("Save error:", error);

    res.status(500).json({
      message: "خطأ في حفظ البيانات "
    });
  }
});

app.get("/messages", async (req, res) => {
  try {
    const messages = await Contact.find().sort({ _id: -1 });
    res.json(messages);
  } catch (error) {
    console.log("Fetch error:", error);

    res.status(500).json({
      message: "خطأ في جلب البيانات "
    });
  }
});

app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log("Register request received for email:", email);

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const existingUser = await User.findOne({ email: email.trim() });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name: name.trim(),
      email: email.trim(),
      password: hashedPassword
    });

    await newUser.save();

    req.session.user = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email
    };

    res.json({
      message: "Registered & logged in ",
      user: req.session.user
    });
  } catch (error) {
    console.log("Register error:", error);

    res.status(500).json({
      message: "Server error "
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Login request received for email:", email);

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({ email: email.trim() });

    if (!user) {
      return res.status(400).json({
        message: "User not found"
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Invalid password"
      });
    }

    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email
    };

    res.json({
      message: "Login successful",
      user: req.session.user
    });
  } catch (error) {
    console.log("Login error:", error);

    res.status(500).json({
      message: "Server error "
    });
  }
});

app.get("/current-user", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({
      message: "Not logged in"
    });
  }

  res.json({
    user: req.session.user
  });
});

app.put("/update-user", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({
        message: "Not logged in"
      });
    }

    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: "Name and email are required"
      });
    }

    const existingEmail = await User.findOne({
      email: email.trim(),
      _id: { $ne: req.session.user.id }
    });

    if (existingEmail) {
      return res.status(400).json({
        message: "Email already exists"
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.session.user.id,
      {
        name: name.trim(),
        email: email.trim()
      },
      { new: true }
    );

    req.session.user = {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email
    };

    res.json({
      message: "Updated successfully",
      user: req.session.user
    });
  } catch (error) {
    console.log("Update error:", error);

    res.status(500).json({
      message: "Update failed"
    });
  }
});

app.put("/change-password", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({
        message: "Not logged in"
      });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "All password fields are required"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters"
      });
    }

    const user = await User.findById(req.session.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Current password is incorrect"
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.json({
      message: "Password changed successfully"
    });
  } catch (error) {
    console.log("Change password error:", error);

    res.status(500).json({
      message: "Password change failed"
    });
  }
});

app.post("/analyze-cv", upload.single("cv"), async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({
        message: "Not logged in"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded"
      });
    }

    if (!process.env.OPENAI_API_KEY || !openai) {
      return res.status(500).json({
        message: "OpenAI API key is missing"
      });
    }

    const uploadedFile = await openai.files.create({
      file: fs.createReadStream(req.file.path),
      purpose: "user_data"
    });

    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_file",
              file_id: uploadedFile.id
            },
            {
              type: "input_text",
              text: `
Analyze this uploaded file and return JSON only. Do not add markdown or explanations outside JSON.

First, check if the uploaded file is actually a CV/resume.

If it is NOT a CV/resume, return exactly:
{
  "isCV": false,
  "message": "The uploaded file does not appear to be a CV or resume."
}

If it IS a CV/resume, return exactly this structure:
{
  "isCV": true,
  "summary": "short CV summary",
  "skills": ["skill1", "skill2", "skill3"],
  "companyMatches": [
    {
      "id": "alj",
      "company": "Abdul Latif Jameel",
      "match": 85,
      "reason": "short reason based on the CV"
    },
    {
      "id": "kapl",
      "company": "King Abdulaziz Public Library",
      "match": 75,
      "reason": "short reason based on the CV"
    },
    {
      "id": "emdad",
      "company": "Emdad Al Khebrat",
      "match": 90,
      "reason": "short reason based on the CV"
    }
  ]
}

The platform has ONLY these internship opportunities:
1. id: "alj" - Abdul Latif Jameel - Suitable fields: business, management, IT, software, engineering, communication, Microsoft Office
2. id: "kapl" - King Abdulaziz Public Library - Suitable fields: research, analysis, communication, teamwork, computer skills, information organization
3. id: "emdad" - Emdad Al Khebrat - Suitable fields: programming, software, IT, computer science, Node.js, Java, JavaScript, SQL, UI/UX, web development

Rules:
- Return JSON only.
- match must be a number from 0 to 100.
- Give higher match to the company that best fits the CV.
- Always include all three companies if it is a CV.
- Use English for summary and reason.
              `
            }
          ]
        }
      ]
    });

    fs.unlink(req.file.path, () => {});

    res.json({
      message: "Analysis done",
      result: response.output_text
    });
  } catch (error) {
    console.log("AI error:", error);

    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }

    res.status(500).json({
      message: "AI analysis failed"
    });
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      return res.status(500).json({
        message: "Logout failed "
      });
    }

    res.json({
      message: "Logged out successfully"
    });
  });
});

app.get("/users", async (req, res) => {
  try {
    const users = await User.find().sort({ _id: -1 });
    res.json(users);
  } catch (error) {
    console.log("Users fetch error:", error);

    res.status(500).json({
      message: "Error fetching users "
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
