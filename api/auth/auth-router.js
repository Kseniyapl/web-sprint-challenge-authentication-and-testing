const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { tokenBuilder } = require('./auth-helper')
const { BCRYPT_ROUNDS } = require('../config')
const Users = require('../users/user-model')
const { validateCreds, checkUsernameExists, checkUsernameFree }= require('./auth-middleware')




router.post('/register', validateCreds, checkUsernameFree, (req, res, next) => {
  let user = req.body
  const hash = bcrypt.hashSync(user.password, BCRYPT_ROUNDS)
  user.password = hash

  Users.add(user)
    .then(saved => {
      res.status(201).json({ message: `Great to have you, ${saved.username}` })
    })
    .catch(next) 
});

router.post('/login', checkUsernameExists, validateCreds, (req, res, next) => {
  
  let { username, password } = req.body

  Users.findBy({ username })
  .then(([user]) => {
    if (user && bcrypt.compareSync(password, user.password)) {
      const token = tokenBuilder(user)
        res.status(200).json({
          message: `Welcome back ${user.username}...`,
          token,
        })
      } else {
        next({ status: 401, message: 'Invalid Credentials' })
      }
    })
    .catch(next)
})  
module.exports = router;
