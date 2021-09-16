const { Router } = require('express');
const router = Router();
const { addCartItem,getCartEmpty,getAllCartItems,editCartQuantity,deleteCartItem } = require('../../controllers/orders/carts')

router.post('/addCartItem/:idUser', addCartItem);
router.get('/getCartEmpty/:idUser', getCartEmpty);
router.get('/getAllCartItems/:idUser', getAllCartItems);
router.put('/editCartQuantity/:idUser', editCartQuantity);
router.delete('/deleteCartItem/:idUser/:idProduct', deleteCartItem);

module.exports = router;