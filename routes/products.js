const express = require('express');
const router = express.Router();
const productsController = require('../controllers/products');

// Get all products
router.get('/', productsController.getAll)

// Get a single product
router.get('/:id', productsController.getSingle);

// Create a new product
router.post('/', /* #swagger.security = [{"BearerAuth": []}] */ productsController.createProduct);

// Update a product
router.put('/:id', /* #swagger.security = [{"BearerAuth": []}] */ productsController.updateProduct);

// Delete a product
router.delete('/:id', /* #swagger.security = [{"BearerAuth": []}] */ productsController.deleteProduct);

module.exports = router;