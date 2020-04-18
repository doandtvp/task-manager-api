const User = require('../models/users')
const jwt = require('jsonwebtoken')

const auth = async (req, res, next) => {
   try {
      // find header provide by user
      const token = req.header('Authorization').replace('Bearer ', '')
      // confirm header
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      // find user by their id and token
      const user = await User.findOne({ _id: decoded._id , 'tokens.token': token })

      if(!user) {
         throw new Error()
      }

      req.token = token
      req.user = user

      // call next to run or throw error if user don't authentication
      next()
   } catch (error) {
      res.status(401).send({error: 'Please authenticate.'})
   }
}


module.exports = auth
