const statsM = require('../models/stats.m');

module.exports = {
    getAll: async (req, res) => {
        const productsAdd = await statsM.getProductsAdd();
        const bestSeller = await statsM.getBestSeller();
        res.send({
            productsAdd: productsAdd,
            bestSeller: bestSeller
        });
    }
};
