const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const sendEmail = require('../config/sendEmails');

module.exports = function (passport) {
  passport.use("local-passReset",
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback : true
      },
      async (req, email, password, done) => {

        try{
          const user = await User.findOne({ email });
          if (user){
            user.password = password;
            await user.save();
            await sendEmail(
              user.email,
              "Password Updated Successfully",
              {
                name: user.displayName,
              },
              "../views/resetPassword.hbs"
            );
            done(null, user);
          }
        } catch (error) {
          if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map((err) => err.message);
            done(null, false, req.flash('updatePasswordMessage', errors ));
          } else {
            console.log(error)
            done(null, false, req.flash('updatePasswordMessage', error));
          }
        }
      }
    )
  )
}