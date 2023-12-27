const express = require("express");
const router = express.Router();
const passport = require("passport");
const accountC = require("../controllers/account.c");

router.post("/signupSubmit", accountC.signup);

router.post(
  "/login",
  passport.authenticate("myStrategies", { failureRedirect: "/",failureFlash: true, }),
  (req, res) => {
    if (req.user.Role === "admin") {
      req.flash("success", "Đăng nhập thành công!");
      res.redirect("/admin");
    } else {
      req.flash("success", "Đăng nhập thành công!");
      res.redirect("/user");
    }
  }
);

module.exports = router;