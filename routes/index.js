const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/auth");
const { deleteUserHandler } = require('../controllers/users');

router.use('/', require('./swagger'));
router.use('/products', require('./products'));
router.use('/ledgers', require('./ledgers'));
router.get("/profile", requireAuth, (req, res) => res.json({ user: req.user }));
router.delete("/users/:id", requireAuth, requireRole("admin"), deleteUserHandler);


module.exports = router;