const express = require("express");
const router = express.Router();
const accountR = require("./account.r");
const homeR = require("./home.r");
const adminR = require("./admin.r");

const accountM = require("../models/account.m");
const userC = require("../controllers/home.c");


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
router.use('/admin', adminR);

const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
    if (!req.session.oauthUser) {
        return res.redirect('/gg');
    }
    next();
};

router.get('/oauth', requireAuth, userC.home);

router.get('/oauth/logout', (req, res) => {
    req.logout(err => {
        if(err) {
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

        try {
            const existingEmail = await accountM.GetEmail(decodedToken.email);

			if (existingEmail === null) {
                await accountM.createAccount(new accountM(decodedToken.email, decodedToken.email, decodedToken.name, null, '', 'user'));
                console.log("Oauth");
			}
            
        } catch (error) {
            console.error('Error in signup:', error);
            res.status(500).send('Internal Server Error');
        }
        
        req.session.oauthUser = true;

        res.redirect('/oauth');

    } catch (error) {
        console.error('Error fetching token:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
