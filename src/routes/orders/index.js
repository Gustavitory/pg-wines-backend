const { Router } = require('express');
const router = Router();
const { getAllOrders, userOrders, getOrderById, updateOrder, updateOrderStatus, updateShipStatus } = require('../../controllers/orders/orders')

router.get('/', getAllOrders); //ok
router.get('/userOrders/:idUser', userOrders); //ok
router.get('/getOrderById/:id', getOrderById); //ok
router.put('/updateOrder/:id', updateOrder); //ok, por analizar productos en body
router.put('/updateOrderStatus/:UserId', updateOrderStatus); //ok, por verificar
router.put('/updateShipStatus', updateShipStatus); //ok


module.exports = router;