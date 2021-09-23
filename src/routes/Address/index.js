const { Router } = require('express');
const router = Router();
const {getAllAdress,deleteAddress,newAddress} = require('../../controllers/addres/address')

router.get('/:userId', getAllAdress);
router.post('/:userId', newAddress);
router.delete('/delete/:addressId', deleteAddress);

module.exports = router;