const { Category } = require('../db');

async function getCategories(req, res) {
    try {
        const categories = await Category.findAll()
        return res.send(categories);
    } catch (err) {
        console.log('ERROR in getCategories', err);
    }
}

async function postCategory(req, res) {
    const { name } = req.body;
    try {
        if (name) {
            const createdCategory = await Category.findOrCreate({
                where: { name: name }
            });
            res.send(createdCategory);
        } else {
            res.status(422).send({ error: 'The field name is required' })
        }
    } catch (err) {
        console.log('ERROR in postCategory', err);
    }
}

async function updateCategory(req, res) {
    const { id, name } = req.body;
    if (!id) return res.status(422).send({ error: 'The category id is required' });
    if (!name) return res.status(422).send({ error: 'You should specified the new name' });

    try {
        const category = await Category.findByPk(id);
        if (!category) return res.status(422).send({ error: 'The category id is wrong' });
        category.name = name;
        await category.save();
        return res.send('The category has been updated suscesfully');
    } catch (err) {
        console.log('ERROR in updateCategory', err);
    }
}

async function deleteCategory(req, res) {
    const { id } = req.body;
    if (!id) return res.send({ error: 'The category id is required' })
    const category = await Category.findByPk(id)
    if (!category) return res.send({ error: 'There is not any category with this id' })
    try {
        await Category.destroy({
            where: {
                id
            }
        })
        return res.send('The category was removed successfully')
    } catch (err) {
        console.log('ERROR in deleteCategory', err);
    }
}

module.exports = {
    getCategories,
    postCategory,
    updateCategory,
    deleteCategory
}