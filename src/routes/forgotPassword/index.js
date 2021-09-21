const { Router } = require('express');
const router = Router();
const { forgotPassword } = require('../../controllers/forgotPassword')

router.post('/', forgotPassword);

module.exports = router;