const { Router } = require('express');

const { getAllUsers, updateUser, deleteUser, loginUser, newUser, getUserByEmail } = require('../../controllers/user/user')


const router = Router();

router.get('/', getAllUsers);
router.post('/login', loginUser);
router.get('/byemail', getUserByEmail);
router.put('/', updateUser); 
router.delete('/:id', deleteUser); 
router.post('/register',newUser);

module.exports = router;