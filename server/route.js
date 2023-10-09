const express = require("express");
const cors = require("cors");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const app = express();
const tar = require("tar");
const path = require("path");
const fs = require("fs");
const xmlToHtml = require("./xml-to-html");
const port = 1001;
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
require("dotenv").config();
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const rimraf = require("rimraf").sync;

const outputDirectory = path.join("..", "output");

app.post("/clear", (req, res) => {
  const directories = [outputDirectory, "uploads"];

  directories.forEach((directory) => {
    fs.readdir(path.join(__dirname, directory), (err, files) => {
      if (err) console.error(err);

      for (const file of files) {
        try {
          rimraf(path.join(__dirname, directory, file));
        } catch (err) {
          console.error(err);
        }
      }
    });
  });

  // Recreate the uploads directory
  fs.mkdir(path.join(__dirname, "uploads"), { recursive: true }, (err) => {
    if (err) throw err;
  });

  res.send("Directories cleared successfully");
});

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

app.use(
  session({
    secret: "my-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:1001/auth/google/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      console.log(profile); // check the profile object here
      return done(null, profile);
    }
  )
);

passport.serializeUser(function (user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function (id, cb) {
  cb(null, { user_id: id });
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google authentication callback route
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", session: true }),
  function (req, res) {
    console.log("req.user", req.user);
    res.redirect("http://localhost:5173/");
  }
);

app.post("/process-file", upload.single("file"), async (req, res) => {
  try {
    let filePath = req.file.path;
    const extractPath = path.join(__dirname, "uploads");

    // 1. Rename file if it has .mbz extension to .tar.gz for clarity
    if (path.extname(filePath) === ".mbz") {
      const newPath = filePath.replace(".mbz", ".tar.gz");
      fs.renameSync(filePath, newPath);
      filePath = newPath; // Update the filePath to point to the renamed file
    }

    // 2. Extract .tar.gz
    await tar.x({
      file: filePath,
      cwd: extractPath,
    });

    console.log(`Processed and stored at ${extractPath}`);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});
app.post("/convert", async (req, res) => {
  try {
    const activitiesPath = path.join(__dirname, "uploads", "activities");
    await xmlToHtml.convertFiles(activitiesPath);
    res.json({ message: "Conversion successful!" });
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});
app.get("/preview", function (req, res) {
  const file = path.join(__dirname, "..", "output", "output.html");

  if (fs.existsSync(file)) {
    res.sendFile(file);
  } else {
    res.status(404).send("File not found");
  }
});
app.get("/download", function (req, res) {
  const file = path.join(__dirname, "..", "output", "output.docx");
  res.download(file);
});

app.get("/user", (req, res) => {
  if (req.user) {
    console.log("req.user", req.user);
    res.json({ user: req.user });
  } else {
    res.json({ user: null });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
