const express = require('express')
const passport = require('passport')
const router = express.Router()
const User = require('../models/User')
const crypto = require('crypto');
const Token = require('../models/tokenSchema')
const sendEmail = require('../config/sendEmails')


router.get('/facebook', passport.authenticate('facebook'));

router.get('/facebook/callback', passport.authenticate('facebook', {
  successRedirect: '/dashboard',
  failureRedirect: '/login',
}));


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

router.post('/signup', passport.authenticate('local-signup', {
  successRedirect: '/confirm-email',
  failureRedirect: '/signup',
  failureFlash: true
}));

router.post('/reset-password', passport.authenticate('local-passReset', {
  successRedirect: '/dashboard',
  failureRedirect: '/reset-password',
  failureFlash: true
}));


// @desc    reset-password-email
// @route   POST /
router.post('/reset-password-email', async (req, res) =>{
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user){
      let token = await Token.findOne({ userId: user._id });
      if (token) {
        await token.deleteOne(); // token.remove();
      }
      // Generate a password reset token
      token = crypto.randomBytes(256).toString('hex');
      await new Token({
        userId: user._id,
        token,
      }).save();
          
      // Send the password reset email
      const link = `${process.env.LINK}/reset-password?token=${token}&user=${user._id}`;
      await sendEmail(user.email, "Password Reset Request", { name: user.displayName, link }, "../views/passResetMail.hbs");
      res.redirect('/confirm-email-password');
    } else {
      req.flash('updatePasswordMessage', 'Error Processing request! Check Email And Try Again.');
      return res.redirect('/reset-password-email');
    }
  } catch (error) {
    console.error(error);
  }
})
// router.post('/reset-password-email', passport.authenticate('passReset', {
//   successRedirect: '/confirm-email',
//   failureRedirect: '/reset-password-email',
//   failureFlash: true
// }));



// @desc   Logout user
// @route   /auth/logout
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log('Error destroying session:', err);
      res.render("error/500")
      // return res.status(500).send('Something went wrong.');
    }
    res.redirect('/login');
  });
})


module.exports = router