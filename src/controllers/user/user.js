const { User} = require('../../db');
const { v4: uuidv4 } = require('uuid');


async function newUser(req, res, next) {
    
    if (!req.body.name || !req.body.email || !req.body.password) {
        return res.status(400).json({ message: 'Bad request' })
    }
    let photoURL="https://i.imgur.com/vfrW9Xx.png";
    if(req.body.photoURL)photoURL=req.body.photoURL
    const { email, name, password, birthDate, phone} = req.body
    const  id=uuidv4();
    let user={id,email,name,birthDate,password,admin:false,photoURL,phone};
    try {
        const exist = await User.findOne({where:{email:user.email}})
        if (exist) { return res.status(500).send({ message: 'El email ya existe.' }) }
        const exist2 = await User.findOne({ where: { name: user.name } })
        if (exist2 !== null) { return res.status(500).json({ message: 'El nombre de usuario ya existe.' }) }
        const id = uuidv4()
        await User.create(user)
        return res.send(user)
    } catch (error) {
        return res.status(500).json({ message: 'Error with DB' })
    }
}

async function updateUser(req, res, next) {
    const { id} = req.body
    try {
        const user = await User.findByPk(id)
        if(!user) return res.status(404).json({error: 'user not found' })
        console.log(user)
        req.body.name ? user.name = req.body.name : '';
        req.body.password ? user.password=req.body.password:'';
        req.body.photoURL?user.photoURL=req.body.photoURL:'';
        
        user.save()
        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({ message: 'Error with DB' })
    };
};


async function getAllUsers(req, res, next) {
    try {
        const user = await User.findAll();
        return res.send(user)
    } catch (error) {
        next({ message: 'Bad Request' })
    }
}

async function getUserByEmail(req, res, next) {
    const {email} = req.body;
    try {
        const user = await User.findOne({
            where: {
                email
            } 
        });
        if(!user) return res.status(404).json({error: 'user not found'});
        return res.send(user)
    } catch (error) {
        next({ message: 'Bad Request' })
    }
}

async function deleteUser(req, res, next) {
    if (!req.params.id) {
        return res.status(400).json({ message: 'ID of the user is needed', status: 400 })
    }
    const { id } = req.params;
    try {
        const local=await User.findByPk(id);
        if(!local) return res.send('El usuario no existe.')
        await User.destroy({
            where: {
                id: id
            }
        })
        return res.send('The user has been deleted.')
    } catch (error) {
        next(error);
    }
}



async function loginUser(req, res, next) {
    const {email, password} = req.body
    try {
        const isUser = await User.findOne({
            where: {
            email
             }
        })
        if (!isUser) {
            return res.send('Inexistent User')
        }
        else if(isUser.password!==password){
            return res.send('Invalid Password')
        }
        else return res.send(isUser)
    } catch (err) {
        next(err)
    }
}



module.exports = {
    updateUser,
    getAllUsers,
    deleteUser,
    loginUser,
    newUser,
    getUserByEmail
}