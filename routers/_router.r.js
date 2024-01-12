const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const accountR = require("./account.r");
const accountC = require("../controllers/account.c");
const userC = require("../controllers/home.c");
const accountM = require("../models/account.m");
const adminR = require("./admin.r");

const homeR = require("./home.r");

const detailsR = require("./details.r");
const relateR = require("./relate_products.r");
const initializeDBM = require("../models/initializeDb.m");

const cartR = require("./cart.r");

const facebookStrategy = require("passport-facebook");
const googleStrategy = require("passport-google-oauth20");

router.get('/', async (req, res) => {
    let theme = req.cookies.theme;
    let dark = theme === "dark" ? true : false;
    const check = await initializeDBM.checkExistDB();
    if (!check) {
        await initializeDBM.createDB();
    }
    res.render('account/login', {
        title: 'Login',
        home: false,
        dark: dark
    })
});

router.get('/signup', async (req, res) => {
    let theme = req.cookies.theme;
    let dark = theme === "dark" ? true : false;
    const check = await initializeDBM.checkExistDB();
    if (!check) {
        await initializeDBM.createDB();
    }
    res.render('account/signup', {
        title: 'Sign Up',
        home: false,
        dark: dark
    })
});

router.use("/acc", accountR);
router.use("/home", homeR);
router.use("/admin", adminR);

router.get("/oauthSignup", async (req, res) => {
  let theme = req.cookies.theme;
  let dark = theme === "dark" ? true : false;
  res.render("account/oauth", {
    title: "Sign Up",
    home: false,
    dark: dark,
  });
});

router.post("/oauthSubmit", accountC.oauthSignup);

const requireAuth = (req, res, next) => {
  if (!req.session.oauthUser) {
    return res.redirect("/gg");
  }
  next();
};

router.get("/home", requireAuth, userC.home);

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

const urlGG = "https://accounts.google.com/o/oauth2/v2/auth";
const access_type = "offline";
const response_type = "code";
const client_id =
  "436389758736-p5lst40jnfjn3l9np4a8v2g07ffur99m.apps.googleusercontent.com";
const client_secret = "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";
const redirect_uri = "http://localhost:3000/auth/google/callback";
const scope = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

router.get("/gg", (req, res) => {
  const qs = new URLSearchParams({
    access_type,
    response_type,
    redirect_uri,
    client_id,
    scope: scope.join(" "),
  }).toString();
  res.redirect(`${urlGG}?${qs}`);
});

router.get("/auth/google/callback", async (req, res, next) => {
  try {
    const code = req.query.code;
    const options = {
      code,
      client_id,
      client_secret,
      redirect_uri,
      grant_type: "authorization_code",
    };

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(options),
    });

    const tokenData = await response.json();
    const idToken = tokenData.id_token;
    const decodedToken = jwt.decode(idToken);
    req.session.oauthUser = "gmail";
    try {
      const existingEmail = await accountM.getEmail(decodedToken.email);
      if(existingEmail) {
        req.session.username = existingEmail.username;
      }
      
      req.session.email = decodedToken.email;

      if (existingEmail === null) {
        return res.redirect("/oauthSignup");
      }
    } catch (error) {
      console.error("Error in signup:", error);
      res.status(500).send("Internal Server Error");
    }
    res.redirect("/home");

  } catch (error) {
    console.error("Error fetching token:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
