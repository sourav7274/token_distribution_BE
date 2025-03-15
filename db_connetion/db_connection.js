
require('dotenv').config();
const moongoose = require('mongoose');

const MONGOURI = process.env.MONGODB

moongoose.connect(MONGOURI).then(() => {
    console.log('Connected to MongoDB')
}).catch((err) =>{
    console.log('Error connecting to MongoDB', err)
})