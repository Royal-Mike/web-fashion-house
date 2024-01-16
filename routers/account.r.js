const express = require("express");
const router = express.Router();
const passport = require("passport");
const accountC = require("../controllers/account.c");

router.post("/forgetSubmit", accountC.forgetpw);
router.post("/vertify", accountC.vertify);
router.post("/resetPassword", accountC.resetpw);
router.post("/oauthSubmit", accountC.oauthSignup);
router.post("/signupSubmit", accountC.signup);
router.post(
	"/login",
	passport.authenticate("myStrategies", { failureRedirect: "/", failureFlash: true, }),
	(req, res) => {
		req.flash("success", "Đăng nhập thành công!");
		if (req.user.role === "admin") {
			res.redirect("/admin");
		} else {
			req.session.username = req.body.username;
			res.redirect("/home");
		}
	}
);

module.exports = router;