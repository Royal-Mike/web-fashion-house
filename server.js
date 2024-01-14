require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('express-flash');
const passport = require('passport');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT | 3000;
const secret = '21127561';

const CustomError = require('./modules/error');
const { create } = require('express-handlebars');
const router = require('./routers/_router.r');

app.use(session({
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

require('./modules/passport')(app);

const hbs = create({
    extname: '.hbs'
});

app.engine('hbs', hbs.engine);
app.set('views', './views');
app.set('view engine', 'hbs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(secret));
app.use(express.urlencoded({ extended: true }));

app.use(express.static('./pic'))
app.use('/imgs', express.static('./imgs'))
app.use('/uploads', express.static('./uploads'))

const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/products');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + file.originalname.match(/\..*$/)[0]);
    }
});

const multi_upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
            const err = new Error('Only .png, .jpg and .jpeg format allowed!');
            err.name = 'ExtensionError';
            return cb(err);
        }
    },
}).array('upload-product', 5);

app.post('/upload', (req, res) => {
    multi_upload(req, res, function (err) {
        if (err) {
            res.send(err.message).end();
            return;
        }
        res.send({ success: true, files: req.files });
    });
});

app.use('/js', express.static('./js'));
app.use('/fonts', express.static('./fonts'))

router.use(passport.initialize());
router.use(passport.session());
app.use(flash());
app.use(router);

app.use((req, res, next) => {
    res.status(404).render('error', {
        code: 404,
        error: true,
        msg: 'Page not found.',
        desc: "The page you're looking for doesn't exist."
    });
});

app.use((err, req, res, next) => {
    const statusCode = err instanceof CustomError ? err.statusCode : 500;
    res.status(statusCode).render('error', {
        code: statusCode,
        error: true,
        msg: 'Server Error.',
        desc: err.message
    });
});

app.listen(port, () => console.log(`Listening on port ${port}!`));