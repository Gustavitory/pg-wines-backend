const { Router } = require('express');
const router = Router();
const {getAllAdress,deleteAddress,newAddress} = require('../../controllers/addres/address')

router.get('/', getAllAdress);
router.post('/', newAddress);
router.delete('/delete', deleteAddress);

module.exports = router;