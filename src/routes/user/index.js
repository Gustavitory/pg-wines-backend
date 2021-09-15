const { Router } = require('express');

const { getAllUsers, updateUser, deleteUser, loginUser, newUser } = require('../../controllers/user/user')


const router = Router();

router.get('/', getAllUsers);
router.get('/login', loginUser);
router.put('/:idUser', updateUser); 
router.delete('/:idUser', deleteUser); 
router.post('/register',newUser);

module.exports = router;