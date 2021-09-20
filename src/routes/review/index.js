const { Router } = require('express');
const {newReview, updateReview, deleteReview} = require('../../controllers/Review/review')  //importar funciones para review


const router = Router();



router.post('/:idUser', newReview);
router.put('/:idReview', updateReview);
router.delete('/:idReview', deleteReview);


module.exports = router;