const jwt = require('jsonwebtoken');
const config = require('config');
const Joi = require("jsonwebtoken");
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true,
        maxlength: 30
    },
    isadmin: {
        type: Boolean,
        default: false
    }
});

userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ id: this._id, isadmin: this.isadmin }, config.get('jwtPrivateKey'));
    return token;
};

const User = mongoose.model('User', userSchema);

function validateUser(user) {
    const schema = {
        firstname: Joi.string().min(1).max(255).required(),
        lastname: Joi.string().min(1).max(255).required(),
        email: Joi.string().min(1).max(255).email().required(),
        password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
    };
    return Joi.validate(user, schema)
}

exports.valudate = validateUser;
exports.User = User;