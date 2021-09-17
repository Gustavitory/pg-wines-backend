const { Router } = require('express');
const router = Router();
const { getProducts, getProductById, postProduct, updateProduct, deleteProduct} = require('../../controllers/products')
const {addFavs,quitFav,getFavs}=require('../../controllers/user/favourites')

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', postProduct);
router.put('/update',updateProduct);
router.delete('/delete',deleteProduct);
router.post('/addFav',addFavs);
router.get('/favs', getFavs);
router.delete('/quitFav',quitFav);

module.exports = router;