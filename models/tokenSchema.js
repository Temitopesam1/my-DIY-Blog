const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;


const tokenSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    token: {
        type: String,
        required: true,
    },
    expireAt: { type: Date,  expires: 1800 }
});

tokenSchema.pre('save', async function(next){
    const token = this
    if(token.isModified('token')){
      token.token = await bcrypt.hash(token.token, 10)
    }
    next()
  })
module.exports = mongoose.model("Token", tokenSchema);