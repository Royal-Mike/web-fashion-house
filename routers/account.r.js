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
		if (req.user.role === "admin") {
			res.redirect("/admin");
		} else {
			res.redirect("/home");
		}
	}
);

module.exports = router;