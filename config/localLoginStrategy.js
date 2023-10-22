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
                if (!user.verified){
                  done(null, false, req.flash('loginMessage', 'Account Not Verified! Try registering again.'));
                  user.deleteOne();
                } else {
                  if (user.password){
                    const isMatch = await bcrypt.compare(password, user.password)
                    if(isMatch){
                      done(null, user);
                    }
                  }
                }
              }
              done(null, false, req.flash('loginMessage', 'Email Or Password Invalid!'));
            } catch (error) {
              if (error.name === 'ValidationError') {
                const errors = Object.values(error.errors).map((err) => err.message);
                done(null, false, req.flash('loginMessage', errors ));
            } else {
                console.log(error)
                done(null, false, req.flash('loginMessage', error));
            }
            }
        }
    )
  )
}