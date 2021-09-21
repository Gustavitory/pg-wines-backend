const { Router } = require('express');
const router = Router();
const { getProducts, getProductById, postProduct, updateProduct, deleteProduct} = require('../../controllers/products')
const {addFavs,quitFav,getFavs}=require('../../controllers/user/favourites')

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', postProduct);
router.put('/update',updateProduct);
router.delete('/delete',deleteProduct);
router.post('/addFav/:iduser',addFavs);
router.get('/favs/:iduser', getFavs);
router.delete('/quitFav/:iduser',quitFav);

module.exports = router;