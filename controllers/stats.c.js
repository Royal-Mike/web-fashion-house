const statsM = require('../models/stats.m');

module.exports = {
    getAll: async (req, res) => {
        const bestSeller = await statsM.getBestSeller();
        res.send({
            bestSeller: bestSeller
        });
    }
};
