const express = require('express');
const router = express.Router();
const ledgersController = require('../controllers/ledgers');

router.get('/', ledgersController.getAll);
router.get('/:id', ledgersController.getSingle);
router.post('/', /* #swagger.security = [{"BearerAuth": []}] */ ledgersController.createLedger);
router.put('/:id', /* #swagger.security = [{"BearerAuth": []}] */ ledgersController.updateLedger);
router.delete('/:id', /* #swagger.security = [{"BearerAuth": []}] */ ledgersController.deleteLedger);

module.exports = router;