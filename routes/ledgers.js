const express = require('express');
const router = express.Router();
const ledgersController = require('../controllers/ledgers');

router.get('/', ledgersController.getAll);
  /* #swagger.tags = ['Ledgers'] */
  /* #swagger.summary = 'Get all ledgers' */

  /* #swagger.responses[200] = {
        description: 'List of ledgers',
        schema: [{
          $ref: '#/components/schemas/Ledgers'
        }]
  } */

router.get('/:id', ledgersController.getSingle);
router.post('/', ledgersController.createLedger);
router.put('/:id', ledgersController.updateLedger);
router.delete('/:id', ledgersController.deleteLedger);

module.exports = router;