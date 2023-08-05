const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User')
const secureRandom = require('secure-random');
const Token = require('../models/tokenSchema')
const sendEmail = require('../config/sendEmails')

module.exports = function (passport) {
  passport.use("local-passReset",
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
      },
      async (req, email, done) => {
        try {
          const user = await User.findOne({ email })
          console.log(user);
          if (user){
            let token = await Token.findOne({ userId: user._id });
            if (token) {
              await token.deleteOne(); // token.remove();
            }
            // Generate a password reset token
            token = secureRandom(256, {type: 'Buffer'});
            await new Token({
              userId: user._id,
              token,
            }).save();
                
            // Send the password reset email
            const link = `www.mystorybook.onrender.com/reset-password?token=${token}&user=${user._id}`;
            const mail = sendEmail(user.email, "Password Reset Request", { name: user.displayName, link }, "../views/passResetMail.hbs");
            if (mail){
              done(null, false, req.flash('updatePasswordMessage', "Check Mail To Continue!"));
            }
          }
          done(null, false, req.flash('updatePasswordMessage', 'Invalid Email!'));
        } catch (error) {
          console.log(error);
          done(null, false, req.flash('updatePasswordMessage', 'Error Processing request! Check Email And Try Again.'));
        }
      }
    )
  )
}