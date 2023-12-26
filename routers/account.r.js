const express = require("express");
const router = express.Router();
const passport = require("passport");
const accountC = require("../controllers/account.c");

router.post("/signupSubmit", accountC.signup);

router.post(
    "/login",
    passport.authenticate("myStrategies", { failureRedirect: "/" }),
    (req, res) => {
      if (req.user.role === "admin") {
        res.redirect("/admin");
      } else {
        res.redirect("/user");
      }
    }
);

module.exports = router;