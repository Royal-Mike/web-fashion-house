const adminM = require('../models/admin.m');

module.exports = {
    home: async (req, res) => {
        let theme = req.cookies.theme;
        let dark = theme === "dark" ? true : false;

        const products = await adminM.getAllProducts();
        const users = await adminM.getAllUsers();

        const pages_p = Math.ceil(products.length / 100);
        const pages_u = Math.ceil(users.length / 10);

        res.render('admin/home', {
            title: 'Admin',
            dark: dark,
            products: products,
            users: users,
            pages_p: [...Array(pages_p + 1).keys()].slice(1),
            pages_u: [...Array(pages_u + 1).keys()].slice(1)
        });
    },
    getPro: async (req, res) => {
        let page = req.body.page;
        let indexStart = (page - 1) * 100;
        let indexEnd = indexStart + 100;
        const products = await adminM.getAllProducts();
        const productsPage = products.slice(indexStart, indexEnd);
        res.send(productsPage);
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
        await adminM.updateUser(req.body);
        res.send('success');
    }
};
