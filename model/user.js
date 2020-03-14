const jwt = require('jsonwebtoken');
const config = require('config');
const Joi = require("joi");
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 1024
    },
    isadmin:{
        type: Boolean,
        default: false
    }
});

userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id,username:this.username, isadmin: this.isadmin }, config.get('jwtPrivateKey'));
    return token;
};

const User = mongoose.model('User', userSchema);

function validateUser(user) {
    const schema = {
        username: Joi.string().min(1).max(50).required(),
        email: Joi.string().min(3).max(255).email().required(),
        password: Joi.string().regex(/^[a-zA-Z0-9]{5,30}$/).required(),
        isadmin:Joi.boolean()
    };
    return Joi.validate(user, schema)
}

function validatePassword(user){
    const schema = {
        password: Joi.string().regex(/^[a-zA-Z0-9]{5,30}$/).required()
    };
    return Joi.validate(user, schema)
}

exports.validate = validateUser;
exports.User = User;
exports.validatePassword = validatePassword; 
exports.userSchema = userSchema;