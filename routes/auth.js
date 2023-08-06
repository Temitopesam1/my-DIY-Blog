const express = require('express')
const passport = require('passport')
const router = express.Router()



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
  successRedirect: '/confirm-email',
  failureRedirect: '/',
  failureFlash: true
}));


// @desc    reset-password-email
// @route   POST /
router.post('/reset-password-email', passport.authenticate('local-passReset', {
  failureRedirect: '/reset-password-email',
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


module.exports = router