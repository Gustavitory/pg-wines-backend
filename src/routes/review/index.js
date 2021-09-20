const { Router } = require('express');
const {newReview, updateReview, deleteReview} = require('../../controllers/Review/review')  //importar funciones para review


const router = Router();



router.post('/review/:idUser', newReview);
router.put('/review/:idReview', updateReview);
router.delete('/review/:idReview', deleteReview);


module.exports = router;