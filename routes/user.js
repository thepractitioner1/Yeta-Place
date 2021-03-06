const express = require('express');
const bcrypt = require("bcrypt");
const router = express.Router();
const _ = require('lodash');
const { User, validate,validatePassword } = require("..//model/user");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");


router.get('/', async (req, res) => {
  const user = await User.find().sort("-name");
  res.send(user);
});

router.get('/me', auth, async (req, res) => {

  const user = await User.findById(req.user._id).select("-password");
  res.send(user);
})

router.get('/:id', auth, async (req, res) => {
  const user = await User.findById(req.params.id);


  if (!user) return res.status(404).send("The user with the given ID was not found.");


  res.send(_.pick(user, ["username", "_id", "email"]));

})

router.post('/createUser', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered.");

  user = new User(_.pick(req.body, ["username", "email", "password","isadmin"]));
  const salt = await bcrypt.genSalt(10);
  // user.isadmin = req.body.isadmin;
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();

  const token = user.generateAuthToken();
  res
    .header("x-auth-token", token)
    .header("access-control-expose-headers", "x-auth-token")
    .send(_.pick(user, ["_id", "username", "email"]));

})

router.put('/updatePassword/:id', auth, async (req, res) => {
  const { error } = validatePassword(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const salt = await bcrypt.genSalt(10);
  const new_password = await bcrypt.hash(req.body.password, salt);
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { password: new_password },
    {
      new: true
    }
  );
  
  if (!user){
    return res.status(404).send("The user with the given ID was not found.");
  }

 
 res.send(user);

})

router.delete("/delete/:id", [auth, admin], async (req, res) => {
  let user = await User.findByIdAndRemove(req.params.id);
  if (!user) return res.status(404).send("The user with the given ID was not found");

  res.send(user);
})



module.exports = router;