const {User,Address} =require('../../db');
const exclude=['createdAt','updatedAt']


const getAllAdress= async (req,res,next)=>{
    const {userId}=req.params;
    if(!userId) return next({ error: "User id is required" });
    try{
        const addresses= await Address.findAll({
            where:{
                userId:userId
            },
            attributes:{
                exclude
            }
        })
        res.status(200).send(addresses)
    }catch(err){
        console.error(err);
    }
}
const deleteAddress=async (req,res,next)=>{
    const {addressId}=req.params;
    if(!addressId) return next({ error: "addressId is required" });
    try{
        await Address.destroy({where:{id:addressId}})
        res.send('Deleted');
    }catch(err){
        console.error(err)
    }
}
const newAddress= async (req,res,next)=>{
    const {userId}=req.params;
    const {country,province,city,address,zipCode}=req.body;
    if(!userId)return next({error:"User id is required"});
    if(!country||!province||!city||!address||!zipCode) return next({error:"Incomplete Data"});
    try{
        const add=await Address.create({country,province,city,address,zipCode});
        const user=await User.findByPk(userId);
        await user.addAddress(add);
        res.status(200).send('New address success')
    }catch(err){
        console.error(err)
    }

}



module.exports={
    getAllAdress,
    deleteAddress,
    newAddress
}
