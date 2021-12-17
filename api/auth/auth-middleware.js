const {findBy} = require('../users/user-model')

const validateCreds =  async (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password) {
        next({
            status: 401,
            message: 'username and password required'
        })
    } else {
        next()
    }
}

const checkUsernameExists = async (req, res, next) => {
    try{
      const [user] = await findBy({username: req.body.username})
      if(!user) {
        next({status: 401, message: "Invalid credentials"})
      }else{
        next() 
      }
    }catch(err){
      next(err)
    } 
  }
  const checkUsernameFree = async (req, res, next) => {
    try{
        const [user] = await findBy({username: req.body.username})
        if(user) {
          next({status: 401, message: "user taken"})
        }else{
          next() 
        }
      }catch(err){
        next(err)
      } 
  }

  module.exports = {
    validateCreds,
    checkUsernameFree,
    checkUsernameExists
}