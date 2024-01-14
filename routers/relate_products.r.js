const express = require("express");
const router = express.Router();
const userC = require("../controllers/home.c");

router.use((req, res, next) => {
    if (req.isAuthenticated() || req.session.oauthUser == "gmail") {
        return next();
    }
    res.redirect("/");
});

router.get("/", userC.getRelatingPage);

router.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            throw err;
        }
    });
    res.redirect("/login");
});

module.exports = router;