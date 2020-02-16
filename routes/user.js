const express = require('express');
const bcrypt = require("bcrypt");
const router = express.Router();
const _ = require('lodash');
const { User, validate } = require("..//model/user");
const auth = require("../middleware/auth");


router.get('/', auth, async (req, res) => {
    const user = await User.find().sort("-name");
    res.send(user);
});

router.get('/me', auth, async (req, res) => {
  
    const user = await User.findById(req.user._id).select("-password");
    res.send(user);
})

router.post('/createUser', async(req,res)=>{
    const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered.");

  user = new User(_.pick(req.body, ["username", "email", "password"]));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();

  const token = user.generateAuthToken();
  res
    .header("x-auth-token", token)
    .header("access-control-expose-headers", "x-auth-token")
    .send(_.pick(user, ["_id", "username", "email"]));

})

module.exports = router;