const express = require("express");
const router = express.Router();
const userC = require("../controllers/home.c");

router.use((req, res, next) => {
    if (req.isAuthenticated() || req.session.oauthUser == "gmail") {
        return next();
    }
    res.redirect("/");
});

router.get("/", userC.home);

router.get("/myProfile", userC.profile);
router.post("/updateProfile", userC.updateprofile);

module.exports = router;
