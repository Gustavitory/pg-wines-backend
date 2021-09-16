const { Router } = require('express');
const router = Router();
const { getAllOrders, userOrders, getOrderById, updateOrder, updateOrderStatus, updateShipStatus } = require('../../controllers/brands')

router.get('/', getAllOrders);
router.get('/:id', userOrders);
router.get('/:id', getOrderById);
router.put('/order/updateOrder/:id', updateOrder);
router.put('/order/updateOrderStatus/:id', updateOrderStatus);
router.put('/order/updateShipStatus/', updateShipStatus);


module.exports = router;