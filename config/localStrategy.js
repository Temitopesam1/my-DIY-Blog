const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User')
const bcrypt = require('bcryptjs');

module.exports = function (passport) {
  passport.use(
    new LocalStrategy(
        {
          usernameField: 'email', // Change this to the field name for the username (e.g., 'username' if applicable)
          passwordField: 'password', // Change this to the field name for the password
        },
        async (email, password, done) => {
            try {
              let user = await User.findOne({ email })

              if (user || bcrypt.compare(password, user.password)) {
                done(null, user)
              }
            } catch (err) {
              console.error(err)
            }
        }
    )
  )

  // passport.serializeUser((user, done) => {
  //   done(null, user.id)
  // })

  // passport.deserializeUser((id, done) => {
  //   User.findById(id, (err, user) => done(err, user))
  // })
}