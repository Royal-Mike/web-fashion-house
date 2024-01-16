const adminM = require('../models/admin.m');
const accountM = require("../models/account.m");
const paymentM = require("../models/payment.m");
const productM = require("../models/product.m");
const catalogueM = require("../models/catalogue.m");
const bcrypt = require("bcrypt");
const saltRounds = 10;

module.exports = {
    home: async (req, res) => {
        let theme = req.cookies.theme;
        let dark = theme === "dark" ? true : false;

        const catalogues = await adminM.getAllCatalogues();
        const products = await adminM.getAllProducts();
        const users = await adminM.getAllUsers();

        const pages_c = Math.ceil(catalogues.length / 10);
        const pages_p = Math.ceil(products.length / 100);
        const pages_u = Math.ceil(users.length / 10);

        const orders = await adminM.getAllOrders();

        function makeArray(pages) {
            return [...Array(pages + 1).keys()].slice(1)
        }

        res.render('admin/home', {
            title: 'Admin',
            dark: dark,
            admin: true,
            catalogues: catalogues,
            orders: orders,
            pages_c: makeArray(pages_c),
            pages_p: makeArray(pages_p),
            pages_u: makeArray(pages_u)
        });
    },
    getCat: async (req, res) => {
        let page = req.body.page;
        let indexStart = (page - 1) * 10;
        let indexEnd = indexStart + 10;
        const catalogues = await adminM.getAllCatalogues();
        const cataloguesPage = catalogues.slice(indexStart, indexEnd);
        res.send(cataloguesPage);
    },
    updateCat: async (req, res) => {
        await catalogueM.updateCat(new catalogueM(req.body));
        res.send('success');
    },
    addCat: async (req, res) => {
        await catalogueM.addCat(new catalogueM(req.body));
        res.send('success');
    },
    deleteCat: async (req, res) => {
        await catalogueM.deleteCat(req.body.id_category);
        res.send('success');
    },
    getPro: async (req, res) => {
        let page = req.body.page;
        let indexStart = (page - 1) * 100;
        let indexEnd = indexStart + 100;
        const products = await adminM.getAllProducts();
        const productsPage = products.slice(indexStart, indexEnd);
        res.send(productsPage);
    },
    updatePro: async (req, res) => {
        await productM.updatePro(new productM(req.body));
        res.send('success');
    },
    addPro: async (req, res) => {
        await productM.addPro(new productM(req.body));
        res.send('success');
    },
    deletePro: async (req, res) => {
        await productM.deletePro(req.body.id);
        res.send('success');
    },
    getUser: async (req, res) => {
        let page = req.body.page;
        let indexStart = (page - 1) * 10;
        let indexEnd = indexStart + 10;
        const users = await adminM.getAllUsers();
        const usersPage = users.slice(indexStart, indexEnd);
        res.send(usersPage);
    },
    updateUser: async (req, res) => {
        let usernameNew = req.body.username;
        let usernameOld = req.body.usernameOld;

        if (usernameNew !== usernameOld) {
            const existingUser = await accountM.getAccount(usernameNew);
            if (existingUser) {
                return res.send('err_username');
            }
        }

        await accountM.updateUser(req.body);
        res.send('success');
    },
    addUser: async (req, res, next) => {
        const un = req.body.username;
        const email = req.body.email;
        const fn = req.body.fullname;
        const dob = req.body.dob;
        const pw = req.body.password;
        const role = req.body.role;

        const existingUser = await accountM.getAccount(un);
        const existingEmail = await accountM.getEmail(email);

        if (existingUser) {
            return res.send('err_username');
        }
        else if (existingEmail && existingEmail.email === email) {
            return res.send('err_email');
        }

        bcrypt.hash(pw, saltRounds, async function (err, hash) {
            if (err) {
                return next(err);
            }
            await accountM.createAccount(new accountM(un, email, fn, dob, hash, role));
            await paymentM.createPaymentAccount(new paymentM(un, 0));
            res.send('success');
        });
    },
    deleteUser: async (req, res) => {
        let username = req.body.username;
        if (req.user.username === username) {
            return res.send('err_username');
        }
        await paymentM.deletePaymentAccount(req.body.username);
        await accountM.deleteUser(req.body.username);
        res.send('success');
    }
};
