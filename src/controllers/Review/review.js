const { Product, Review, User } = require('../../db.js');
// const { v4: uuidv4 } = require('uuid');

const newReview = async(req, res, next) => {
    const { comment, rating, idProd } = req.body;
    const { idUser } = req.params;
    if (!comment) return res.send({ error: "A comment is required" });
    if(!rating ) return res.send({ error: "A reting is required" });
    try {
        // const id = uuidv4()
        const verifyDuplicate = await Review.findOne({
            where: {
                userId: idUser,
                productId: idProd
            }
        })
        if(verifyDuplicate) return res.send({ error: "You have already reviewed this product" });
        await Review.create({
            // id,
            rating,
            comment,
            userId: idUser,
            productId: idProd
        })
        // const Prod = await Product.findByPk(idProd)
        // await Prod.addReview(id)
        // const user = await User.findByPk(idUser)
        // await user.addReview(id)
        return res.send('Thank you for your review');
    } catch (error){
        next(error)
    }
}

const updateReview = async (req, res, next)  => {
	const idRev = req.params.idReview;
    const { comment, rating } = req.body;
	try{
		let rev = await Review.findByPk(idRev);
        if (!rev) return res.status(404).json({ error: 'There is not any review with that id' });
		if (comment) rev.comment = comment;
		if (rating) rev.rating = rating;
		await rev.save();
		return res.status(200).send('Review updated');
	}catch(error){
		return res.status(500).json(error.message);
	}
}

const deleteReview = async (req, res, next) => {
	const idRev = req.params.idReview;
    try {
            let rev = await Review.findByPk(idRev);
            if (!rev) return res.status(404).json({ error: 'There is not any review with that id' });
        	await Review.destroy({
            	where: {
                	id: idRev
            	}
        })
        return res.status(200).send('The review was succesfully deleted')
    } catch (error) {
        next(error);
    }
}



module.exports = {
    newReview, 
    updateReview, 
    deleteReview
}
