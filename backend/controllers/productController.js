const ProductModel = require('../models/ProductModel');

exports.listProducts = (req, res) => {
    try {
        const products = ProductModel.findAll();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch products" });
    }
};
