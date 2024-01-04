const statsM = require('../models/stats.m');

module.exports = {
    getAll: async (req, res) => {
        const productsAdd = await statsM.getProductsAdd();
        const revenueYear = await statsM.getRevenueYear();
        const bestSeller = await statsM.getBestSeller();
        res.send({
            productsAdd: productsAdd,
            revenueYear: revenueYear,
            bestSeller: bestSeller
        });
    }
};
