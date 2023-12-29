const express = require("express");
const router = express.Router();
const adminC = require("../controllers/admin.c");

router.use((req, res, next) => {
    if (req.isAuthenticated() && req.user.role === "admin") {
        return next();
    }
    res.redirect("/");
});

router.get('/', adminC.home);

module.exports = router;
