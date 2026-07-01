const express = require("express");
const bodyParser = require("body-parser");
const mongodb = require("./db/connect");

const port = process.env.PORT || 8080;
const app = express();
require("dotenv").config();
const passport = require("passport");
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:8080/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      const user = {
        googleId: profile.id,
        displayName: profile.displayName,
        email: profile.emails[0].value,
      };
      return done(null, profile);
    },
  ),
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: false,
  }),
);

app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.send("<a href='/auth/google'>Login with Google</a>");
});

app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    const token = jwt.sign(
      {
        googleId: req.user.id,
        email: req.user.emails[0].value,
        displayName: req.user.displayName,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );
    req.session.jwt = token; // store in session so /auth/token can access it
    res.redirect("/profile");
  },
);

app.get("/auth/token", (req, res) => {
  if (!req.session.jwt) return res.status(401).json({ error: "Not Authenticated" });
  res.json({ token: req.session.jwt });
});

app.get("/profile", (req, res) => {
  res.json({ user: req.user });
});

app.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

app
  .use(bodyParser.json())
  .use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    next();
  })
  .use("/", require("./routes"));

mongodb.initDb((err, mongodb) => {
  if (err) {
    console.error(err);
  } else {
    app.listen(port, () => {
      console.log(`Connected to MongoDB and Server is running on port ${port}`);
    });
  }
});

