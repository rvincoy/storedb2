const express = require('express');
const router = express.Router();

router.use('/', require('./swagger'));
router.use('/products', require('./products'));
router.use('/ledgers', require('./ledgers'));

module.exports = router;