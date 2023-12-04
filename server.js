require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const app = express();
const port = process.env.PORT | 3000;
const secret = '21127561';

let isDark = false;

const CustomError = require('./modules/error');
const { create } = require('express-handlebars');

app.use(session({
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

const hbs = create({
    extname: '.hbs'
});

app.engine('hbs', hbs.engine);
app.set('views', './views');
app.set('view engine', 'hbs');

app.use(cookieParser(secret));
app.use(express.urlencoded({ extended: true }));

app.use('/js', express.static('./js'));
// app.use('/?', require('./routers/?.r'));

app.get('/', async (req, res) => {
    res.render('account/login', {
        title: 'Login',
        home: false,
        theme: isDark ? 'dark' : 'light',
        isDark: isDark
    })
});

app.get('/signup', async (req, res) => {
    res.render('account/signup', {
        title: 'Sign Up',
        home: false,
        theme: isDark ? 'dark' : 'light',
        isDark: isDark
    })
});

app.use((req, res, next) => {
    res.status(404).render('error', {
        code: 404,
        msg: 'Page not found.',
        desc: "The page you're looking for doesn't exist."
    });
});

app.use((err, req, res, next) => {
    const statusCode = err instanceof CustomError ? err.statusCode : 500;
    res.status(statusCode).render('error', {
        code: statusCode,
        msg: 'Server Error.',
        desc: err.message
    });
});

app.listen(port, () => console.log(`Listening on port ${port}!`));