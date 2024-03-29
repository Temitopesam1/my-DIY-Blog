const GoogleStrategy = require('passport-google-oauth20').Strategy
const User = require('../models/User')

module.exports = function (passport) {
  passport.use("google",
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_URL,
        scope: ['profile', 'email'],
        access_type: 'online',
        response_type: 'code'
      },
      async (accessToken, refreshToken, profile, done) => {

        try {
          let user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            return done(null, user);
           } else {
            const newUser = {
              googleId: profile.id,
              displayName: profile.displayName,
              firstName: profile.name.givenName,
              lastName: profile.name.familyName,
              image: profile.photos[0].value,
              email: profile.emails[0].value,
              verified: profile.emails[0].verified
            }
            user = await User.create(newUser);
            return done(null, user);
          }
        } catch (err) {
          console.error(err)
        }
      }
    )
  )
}