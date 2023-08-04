const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User')
const bcrypt = require('bcryptjs');

module.exports = function (passport) {
  passport.use("local-login",
    new LocalStrategy(
        {
          usernameField: 'email',
          passwordField: 'password',
          passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        async (req, email, password, done) => {
            try {
              let user = await User.findOne({ email })

              if (user){
                if (user.password){
                  const isMatch = await bcrypt.compare(password, user.password)
                  if(isMatch ){
                    done(null, user);
                  }
                }
              }
              done(null, false, req.flash('loginMessage', 'Email Or Password Invalid!'));
            } catch (err) {
              console.error(err)
            }
        }
    )
  )
}