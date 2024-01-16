const cartM = require("../models/cart.m");

module.exports = {
    addToCart: async (req, res) => {
        const product_id = req.query.id;
        const size = req.query.size;
        const quantity = req.query.quantity;
        const username = req.session.username;
        let price;

        if (!req.session.cart) {
            req.session.cart = [];
        }
        const isExist = await cartM.checkExistProductInCart(username, product_id, size);

        const isExistProductIndex = req.session.cart.findIndex(item => item.id === parseInt(product_id));
        if (isExistProductIndex !== -1) {
            if (req.session.cart[isExistProductIndex].size === size) {
                req.session.cart[isExistProductIndex].quantity = parseInt(req.session.cart[isExistProductIndex].quantity) + parseInt(quantity);
                req.session.cart[isExistProductIndex].total_price = (req.session.cart[isExistProductIndex].quantity * req.session.cart[isExistProductIndex].price).toFixed(2);
                if (parseInt(isExist) > 0) {
                    await cartM.modifyQuantityInCart(username, product_id, size, parseInt(req.session.cart[isExistProductIndex].quantity));
                    return;
                }
            } else {
                try {
                    const product = await cartM.get(product_id);
                    product.quantity = quantity;
                    product.size = size;
                    product.total_price = (product.quantity * product.price).toFixed(2);
                    req.session.cart.push(product);
                    price = product.price;
                } catch (error) {
                    console.log(error);
                }
            }
        } else {
            try {
                const product = await cartM.get(product_id);
                product.quantity = quantity;
                product.size = size;
                product.total_price = (product.quantity * product.price).toFixed(2);
                req.session.cart.push(product);
                price = product.price;
            } catch (error) {
                console.log(error);
            }
        }

        const productInCart = new cartM(username, parseInt(product_id), size, price, parseInt(quantity));
        const rs = await cartM.addProductToCart(productInCart);
        res.redirect(`http://localhost:3000/details?id=${product_id}`);
    },
    cartPage: async (req, res) => {
        let theme = req.cookies.theme;
        let dark = theme === "dark" ? true : false;

        const productsInDB = await cartM.getProductFromCart("username", req.session.username);

        let currentCart = [];
        for (const p of productsInDB) {
            const product = await cartM.get(p.product_id);
            product.quantity = p.quantity;
            product.size = p.size;
            product.total_price = product.price * product.quantity;
            currentCart.push(product);
        }
        let isEmptyCart = false;
        if (currentCart.length === 0) {
            isEmptyCart = true;
        }
        currentCart.forEach(product => {
            product.images = product.images[0];
        });
        req.session.cart = currentCart;

        res.render("payment/cart", {
            isEmptyCart: isEmptyCart,
            currentCart: currentCart,
            dark: dark,
            home: true,
            title: 'Cart'
        });
    },
    increaseQuantity: async (req, res) => {
        let currentCart = req.session.cart;
        const username = req.session.username;

        const productIndex = currentCart.findIndex(p => p.id === parseInt(req.query.id) && p.size === req.query.size);
        if (productIndex !== -1) {
            currentCart[productIndex].quantity++;
            currentCart[productIndex].total_price = (currentCart[productIndex].quantity * currentCart[productIndex].price).toFixed(2);
        }
        req.session.cart = currentCart;

        const product_id = currentCart[productIndex].id;
        const size = currentCart[productIndex].size;
        const quantity = currentCart[productIndex].quantity;
        await cartM.modifyQuantityInCart(username, product_id, size, quantity);

        res.json({ quantity: currentCart[productIndex].quantity, total_price: currentCart[productIndex].total_price });
    },
    decreaseQuantity: async (req, res) => {
        let currentCart = req.session.cart;
        const username = req.session.username;
        const productIndex = currentCart.findIndex(p => p.id === parseInt(req.query.id) && p.size === req.query.size);
        if (productIndex !== -1) {
            if (currentCart[productIndex].quantity > 1) {
                currentCart[productIndex].quantity--;
                currentCart[productIndex].total_price = (currentCart[productIndex].quantity * currentCart[productIndex].price).toFixed(2);

            } else {
                currentCart[productIndex].quantity--;
                currentCart[productIndex].total_price = 0;
                res.json({ quantity: 0, total_price: 0 });
                return;
            }
        }
        req.session.cart = currentCart;

        const product_id = currentCart[productIndex].id;
        const size = currentCart[productIndex].size;
        const quantity = currentCart[productIndex].quantity;
        await cartM.modifyQuantityInCart(username, product_id, size, quantity);
        res.json({ quantity: currentCart[productIndex].quantity, total_price: currentCart[productIndex].total_price });
    }

}