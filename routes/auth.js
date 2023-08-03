const express = require('express')
const passport = require('passport')
const router = express.Router()


// @desc    Auth with Google
// @route   GET /auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));


// @desc    Google auth callback
// @route   GET /auth/google/callback
// router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
//   // Successful authentication, redirect or handle the response as needed
//   res.redirect('/dashboard');
// });

router.get('/google/callback', passport.authenticate('google', {
  successRedirect: '/dashboard',
  failureRedirect: '/login',
}));

// Local authentication route
router.post('/login', passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/login',
  failureFlash: true, // Enable flash messages (if you want to show messages on failed login attempts)
}), (req, res) => { console.log(req.body, "THIS IS LOGIN")});

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