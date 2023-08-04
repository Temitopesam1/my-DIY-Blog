const express = require('express')
const passport = require('passport')
const router = express.Router()
const User = require('../models/User')
const secureRandom = require('secure-random');
const Token = require('../models/tokenSchema')
const sendEmail = require('../config/sendEmails')



// @desc    Auth with Google
// @route   GET /auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));


// @desc    Google auth callback
// @route   GET /auth/google/callback
router.get('/google/callback', passport.authenticate('google', {
  successRedirect: '/dashboard',
  failureRedirect: '/login',
}));

// Local authentication route
router.post('/login', passport.authenticate('local-login', {
  successRedirect: '/dashboard',
  failureRedirect: '/login',
  failureFlash: true
}));

router.post('/', passport.authenticate('local-signup', {
  successRedirect: '/dashboard',
  failureRedirect: '/',
  failureFlash: true
}));

// @desc   Logout user
// @route   /auth/logout
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log('Error destroying session:', err);
      return res.status(500).send('Something went wrong.');
    }
    res.redirect('/login');
  });
})



// @desc    reset-password-email
// @route   POST /
router.post("/reset-password-email", async(req, res) => {
  const { email } = req.body;
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
              return req.flash('updatePasswordMessage', "Check Mail To Continue!");
          }
      }
      return req.flash('updatePasswordMessage', 'Error Processing request! Check Email And Try Again.');
  } catch (error) {
      console.log(error);
      return req.flash('updatePasswordMessage', 'Error Processing request! Check Email And Try Again.');
  }
})

module.exports = router