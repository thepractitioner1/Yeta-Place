const express = require('express');
const bcrypt = require("bcrypt");
const router = express.Router();
const { User, validate } = require("../model/user");


router.get('/', auth, async (req, res) => {
    const user = await User.find().sort("-name");
    res.send(user);
});

router.get('/me', auth, async (req, res) => {
    const user = await (await User.findById(req.user._id)).select('-password')
})