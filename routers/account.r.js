const express = require("express");
const router = express.Router();
const passport = require("passport");
const accountC = require("../controllers/account.c");

router.post("/signupSubmit", accountC.signup);

router.post(
	"/login",
	passport.authenticate("myStrategies", { failureRedirect: "/", failureFlash: true, }),
	(req, res) => {
		req.flash("success", "Đăng nhập thành công!");
		if (req.user.Role === "admin") {
			res.redirect("/admin");
		} else {
			// console.log("Đăng nhập thành công");
			res.redirect("/home");
		}
	}
);

module.exports = router;