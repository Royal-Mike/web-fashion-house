const express = require("express");
const router = express.Router();
const accountR = require("./account.r");
const homeR = require("./home.r");
const detailsR = require('./details.r');
const adminR = require("./admin.r");
const relateR = require("./relate_products.r");
const filterR = require("./filter_products.r");

router.get('/', async (req, res) => {
    let theme = req.cookies.theme;
    let dark = theme === "dark" ? true : false;
    res.render('account/login', {
        title: 'Login',
        home: false,
        dark: dark
    })
});

router.get('/signup', async (req, res) => {
    let theme = req.cookies.theme;
    let dark = theme === "dark" ? true : false;
    res.render('account/signup', {
        title: 'Sign Up',
        home: false,
        dark: dark
    })
});

router.use('/acc', accountR);
router.use('/home', homeR);
router.use('/details', detailsR);
router.use('/relating-products', relateR);
router.use('/filter-products', filterR);
router.use("/admin", adminR);

module.exports = router;
