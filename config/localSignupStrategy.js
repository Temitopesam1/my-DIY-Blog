const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User')
const sendEmail = require('./sendEmails');

module.exports = function (passport) {
  passport.use("local-signup",
    new LocalStrategy(
        {
          usernameField: 'email',
          passwordField: 'password',
          passReqToCallback : true


        },
        async (req, email, password, done) => {
            try {
                let user = await User.findOne({ email })
                if (user) {
                    done(null, false, req.flash('signupMessage', 'Email Already Taken!'));
                }
                const mail = sendEmail(
                    req.body.email,
                    "Registration Successful",
                    {
                        name: req.body.displayName,
                    },
                    "../views/welcome.hbs"
                );
                if (!mail){
                    done(null, false, req.flash('signupMessage', 'Error Processing request! Check Email And Try Again.'));
                };
                user = new User({ email, password, displayName: req.body.displayName });
                await user.save();
                done(null, user)
            } catch (error) {
                if (error.name === 'ValidationError') {
                    const errors = Object.values(error.errors).map((err) => err.message);
                    done(null, false, req.flash('signupMessage', errors));
                }
                console.log(error, req.body);
                done(null, false, req.flash('signupMessage', error));
            }
        }
    )
  )
}