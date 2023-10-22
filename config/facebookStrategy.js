const FacebookStrategy = require('passport-facebook').Strategy
const User = require('../models/User')

module.exports = function (passport) {
  passport.use("facebook",
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: process.env.FACEBOOK_URL,
        scope: ['profile', 'email'],
        access_type: 'online',
        response_type: 'code'
      },
      async (accessToken, refreshToken, profile, done) => {
        console.log(profile);
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
            };
            // create the user in our db
            user = await User.create(newUser);
            return done(null, user);
          }
        } catch (err) {
          console.error(err);
        }
      }
    )
  )
}