const { response } = require("express");
const cartM = require("../models/cart.m");

module.exports = {
    addToCart: async (req, res) => {
        const product_id = req.query.id;
        // console.log(product_id);
        if (!req.session.cart) {
            req.session.cart = [];
            console.log("here");
        }
        // console.log("session: ", req.session);
        const isExistProductIndex = req.session.cart.findIndex(item => item.id === parseInt(product_id));
        if (isExistProductIndex !== -1) {
            req.session.cart[isExistProductIndex].quantity += 1;
        } else {
            try {
                const product = await cartM.get(product_id);
                product.quantity = 1;
                req.session.cart.push(product);
            } catch (error) {
                console.log(error);
            }
        }
        res.redirect(`http://localhost:3000/details?id=${product_id}`);
    },
    cartPage: (req, res) => {
        // console.log(req.session);
        let currentCart = req.session.cart;
        let isEmptyCart = false;
        if (!currentCart) {
            isEmptyCart = true;
        }
        // console.log(currentCart);
        res.render("payment/cart", {
            isEmptyCart: isEmptyCart,
            currentCart: currentCart,
        });
    },
    increaseQuantity: (req, res) => {
        console.log(req.query.id);
        res.redirect("/cart");
    }
}