const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const randomstring = require("randomstring");

const CLIENT_ID = '436389758736-p5lst40jnfjn3l9np4a8v2g07ffur99m.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '1//04wbkDa7HYhHkCgYIARAAGAQSNwF-L9IrraPy-_scZ5uRi4DIlB3jqiFjCepDb70WYDiFyw71dxE5qvz3Dpfvwm6zWrRczj_RlYM';

const oAuth2Client  = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function sendMail() {
  const otp = randomstring.generate(4);

  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'nhpqui21@clc.fitus.edu.vn',
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken
      }
    })

    const mailOpt = {
      from: '<Fashion House>',
      to: 'nguyenhuynhphuqui4856@gmail.com',
      subject: "Quên mật khẩu",
      html: `<p>Mã OTP của bạn là: <span style="color: blue; text-decoration: underline">${otp}</span></p>`
    };

    const result = await transport.sendMail(mailOpt);
    return result;

  } catch (error) {
    return error;
  }
}

router.get('/forget', (req, res) => {
  sendMail()
  .then(result => console.log('Email sent ...', result))
  .catch(error => console.log(error.message));
  // res.render('account/fpw');
});

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

router.post("/forgetSubmit", accountC.forgetpw);
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
