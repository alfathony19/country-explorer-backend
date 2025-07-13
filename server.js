const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("uploads")); // untuk akses gambar lewat URL

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // folder tujuan
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// MySQL config
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "country_explorer",
});

db.connect((err) => {
  if (err) console.error("MySQL connection failed:", err);
  else console.log("MySQL connected");
});

// Endpoint untuk menerima form dengan gambar
app.post("/signup", upload.single("profile"), (req, res) => {
  const { email, username } = req.body;
  const profileImage = req.file?.filename || null;

  const sql =
    "INSERT INTO users (email, username, profile_image) VALUES (?, ?, ?)";
  db.query(sql, [email, username, profileImage], (err, result) => {
    if (err) {
      console.error("Insert error:", err);
      res.status(500).json({ message: "Failed to save user" });
    } else {
      res.status(200).json({ message: "User saved", image: profileImage });
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

app.get("/user", (req, res) => {
  res.send("Hello from backend!");
  const email = req.query.email;
  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], (err, results) => {
    if (err) return res.status(500).json({ message: "DB Error" });
    if (results.length === 0)
      return res.status(404).json({ message: "User not found" });
    res.status(200).json(results[0]);
  });
});

app.use("/uploads", express.static("uploads"));
