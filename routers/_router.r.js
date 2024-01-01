const express = require("express");
const jwt = require('jsonwebtoken');
const router = express.Router();

const accountR = require("./account.r");
const accountC = require("../controllers/account.c");
const accountM = require("../models/account.m");
const adminR = require("./admin.r");

const homeR = require("./home.r");
const userC = require("../controllers/home.c");

const detailsR = require("./details.r");
const relateR = require("./relate_products.r");

const cartR = require("./cart.r");

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
router.use('/admin', adminR);

router.use('/home', homeR);
router.use('/details', detailsR);

router.get('/oauthSignup', async (req, res) => {
    let theme = req.cookies.theme;
    let dark = theme === "dark" ? true : false;
    res.render('account/oauth', {
        title: 'Sign Up',
        home: false,
        dark: dark
    })
});

router.post("/oauthSubmit", accountC.oauthSignup);

const requireAuth = (req, res, next) => {
    if (!req.session.oauthUser) {
        return res.redirect('/gg');
    }
    next();
};

router.get('/gmail', requireAuth, userC.home);

router.get('/logout', (req, res) => {
    req.logout(err => {
        if (err) {
            throw err;
        }
    });
    res.redirect('/');
})

const urlGG = 'https://accounts.google.com/o/oauth2/v2/auth';
const access_type = 'offline';
const response_type = 'code';
const client_id = '436389758736-aapm1nvvhfgi9u05nt06l6ju5crib93g.apps.googleusercontent.com';
const client_secret = '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';
const redirect_uri = 'http://localhost:3000/gg/auth';
const scope = ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'];

router.get('/gg', (req, res) => {
    const qs = new URLSearchParams({
        access_type,
        response_type,
        redirect_uri,
        client_id,
        scope: scope.join(' '),
    }).toString();
    res.redirect(`${urlGG}?${qs}`);
})

router.get('/gg/auth', async (req, res, next) => {
    try {
        const code = req.query.code;
        const options = {
            code,
            client_id,
            client_secret,
            redirect_uri,
            grant_type: 'authorization_code'
        };

        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(options)
        });

        const tokenData = await response.json();
        const idToken = tokenData.id_token;
        const decodedToken = jwt.decode(idToken, 21127561); //secret

        req.session.oauthUser = true;
        req.flash("role", "/home");

        try {
            const existingEmail = await accountM.getEmail(decodedToken.email);

            req.session.oauth = decodedToken.email;

			if (existingEmail === null) {
                return res.redirect('/oauthSignup');
			}
            
        } catch (error) {
            console.error('Error in signup:', error);
            res.status(500).send('Internal Server Error');
        }
        res.redirect('/gmail');

    } catch (error) {
        console.error('Error fetching token:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.use('/relating-products', relateR);

router.use("/cart", cartR);

module.exports = router;
