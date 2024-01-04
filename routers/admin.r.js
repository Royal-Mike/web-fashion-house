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

router.post('/getcat', adminC.getCat);
router.post('/updcat', adminC.updateCat);
router.post('/addcat', adminC.addCat);
router.post('/delcat', adminC.deleteCat);

router.post('/getpro', adminC.getPro);
router.post('/updpro', adminC.updatePro);
router.post('/addpro', adminC.addPro);
router.post('/delpro', adminC.deletePro);

router.post('/getuser', adminC.getUser);
router.post('/upduser', adminC.updateUser);
router.post('/adduser', adminC.addUser);
router.post('/deluser', adminC.deleteUser);

module.exports = router;
