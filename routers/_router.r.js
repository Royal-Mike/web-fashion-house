const express = require("express");
const passport = require("passport");
const router = express.Router();

const accountR = require("./account.r");
const accountC = require("../controllers/account.c");
const accountM = require("../models/account.m");
const adminR = require("./admin.r");

const homeR = require("./home.r");
const userC = require("../controllers/home.c");

const detailsR = require("./details.r");
const relateR = require("./relate_products.r");

const cartR = require("./cart.r");

const facebookStrategy = require("passport-facebook");
const googleStrategy = require("passport-google-oauth20");

router.get("/", async (req, res) => {
  let theme = req.cookies.theme;
  let dark = theme === "dark" ? true : false;
  res.render("account/login", {
    title: "Login",
    home: false,
    dark: dark,
  });
});

router.get("/signup", async (req, res) => {
  let theme = req.cookies.theme;
  let dark = theme === "dark" ? true : false;
  res.render("account/signup", {
    title: "Sign Up",
    home: false,
    dark: dark,
  });
});

router.use("/acc", accountR);
router.use("/home", homeR);
router.use("/admin", adminR);

router.get("/gg-register", async (req, res) => {
  let theme = req.cookies.theme;
  let dark = theme === "dark" ? true : false;
  res.render("account/gg", {
    title: "Sign Up",
    home: false,
    dark: dark,
  });
});

router.get("/fb-register", async (req, res) => {
  let theme = req.cookies.theme;
  let dark = theme === "dark" ? true : false;
  res.render("account/fb", {
    title: "Sign Up",
    home: false,
    dark: dark,
  });
});

router.post("/gg-submit", accountC.ggSignup);
router.post("/fb-submit", accountC.fbSignup);

passport.use(
  new googleStrategy(
    {
      clientID:
        "436389758736-p5lst40jnfjn3l9np4a8v2g07ffur99m.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: "/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      const user = {
        displayName: profile.name,
      };

      return done(null, profile);
    }
  )
);

passport.use(
  new facebookStrategy(
    {
      clientID: "790776923086518",
      clientSecret: "f9861767c8a2374425b88eaeba69c129",
      callbackURL: "/auth/facebook/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      const user = {
        displayName: profile.displayName,
      };

      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

router.get("/fb", passport.authenticate("facebook"));
router.get("/gg", passport.authenticate("google", { scope: ["profile"] }));

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  async (req, res) => {
    try {
      const existingUser = await accountM.getAccount(req.user.displayName);

      if (existingUser === null) {
        return res.redirect("/gg-register");
      }
    } catch (error) {
      console.error("Error fetching token:", error);
      res.status(500).send("Internal Server Error");
    }
    res.redirect("/home");
  }
);

router.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/" }),
  async (req, res) => {
    try {
      const existingUser = await accountM.getAccount(req.user.displayName);

      if (existingUser === null) {
        return res.redirect("/fb-register");
      }
    } catch (error) {
      console.error("Error fetching token:", error);
      res.status(500).send("Internal Server Error");
    }
    res.redirect("/home");
  }
);

router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      throw err;
    }
  });
  res.redirect("/");
});

router.use('/details', detailsR);
router.use('/relating-products', relateR);

router.use("/cart", cartR);

module.exports = router;
