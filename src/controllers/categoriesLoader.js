const { Category } = require('../db');
const categoriesDb = require('../data/categories.json')

const bulkCreateCategories = async() => {
    try {        
        await Category.bulkCreate(categoriesDb);
    } catch(err){
        console.log('ERROR in bulkCreateCategories', err);
    }
}

module.exports = {
    bulkCreateCategories
}
