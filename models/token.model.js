const mongoose = require("mongoose")

const tokenSchema = new mongoose.Schema({
    code:String,
    claimedBy:{
        type:String,
        default:null
    },
    lastClaimed: {
        type:Date,
        default:Date.now
    }
})

const Token = mongoose.model("Token",tokenSchema)

module.exports = Token