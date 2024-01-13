const { response } = require("express");
const cartM = require("../models/cart.m");

module.exports = {
    addToCart: async (req, res) => {
        const product_id = req.query.id;
        const size = req.query.size;
        console.log(req.query);
        // console.log(product_id);
        if (!req.session.cart) {
            req.session.cart = [];
            // console.log("here");
        }
        // console.log("session: ", req.session);
        const isExistProductIndex = req.session.cart.findIndex(item => item.id === parseInt(product_id));
        if (isExistProductIndex !== -1) {
            if (req.session.cart[isExistProductIndex].size === size) {
                req.session.cart[isExistProductIndex].quantity += 1;
                req.session.cart[isExistProductIndex].total_price = (req.session.cart[isExistProductIndex].quantity * req.session.cart[isExistProductIndex].price).toFixed(2);
            } else {
                try {
                    const product = await cartM.get(product_id);
                    product.quantity = 1;
                    product.size = size;
                    product.total_price = (product.quantity * product.price).toFixed(2);
                    req.session.cart.push(product);
                } catch (error) {
                    console.log(error);
                }
            }
        } else {
            try {
                const product = await cartM.get(product_id);
                product.quantity = 1;
                product.size = size;
                product.total_price = (product.quantity * product.price).toFixed(2);
                req.session.cart.push(product);
            } catch (error) {
                console.log(error);
            }
        }
        res.redirect(`http://localhost:3000/details?id=${product_id}`);
    },
    cartPage: (req, res) => {
        // console.log(req.session);
        let currentCart = req.session.cart || [];
        let isEmptyCart = false;
        if (currentCart.length === 0) {
            isEmptyCart = true;
        }
        // console.log(currentCart);
        res.render("payment/cart", {
            isEmptyCart: isEmptyCart,
            currentCart: currentCart,
        });
    },
    increaseQuantity: (req, res) => {
        let currentCart = req.session.cart;
        console.log(req.query);
        console.log(currentCart);
        const productIndex = currentCart.findIndex(p => p.id === parseInt(req.query.id) && p.size === req.query.size);
        if (productIndex !== -1) {
            currentCart[productIndex].quantity++;
            currentCart[productIndex].total_price = (currentCart[productIndex].quantity * currentCart[productIndex].price).toFixed(2);
        }
        req.session.cart = currentCart;
        // console.log(currentCart);
        res.redirect("/cart");
    },
    decreaseQuantity: (req, res) => {
        let currentCart = req.session.cart;
        const productIndex = currentCart.findIndex(p => p.id === parseInt(req.query.id) && p.size === req.query.size);
        if (productIndex !== -1) {
            if (currentCart[productIndex].quantity > 1) {
                currentCart[productIndex].quantity--;
                currentCart[productIndex].total_price = (currentCart[productIndex].quantity * currentCart[productIndex].price).toFixed(2);

            } else {
                currentCart.splice(productIndex, 1);
            }
        }
        req.session.cart = currentCart;
        res.redirect("/cart");
    }

}