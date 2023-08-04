const express = require("express")
const router = express.Router()
const { ensureGuest, ensureAuth } = require("../middleware/auth")
const Story = require("../models/Story")
const User = require('../models/User')
const secureRandom = require('secure-random');
const Token = require('../models/tokenSchema')
const sendEmail = require('../config/sendEmails')
const bcrypt = require('bcryptjs');



// @desc    Signup/Landing page
// @route   GET /
router.get("/", ensureGuest, (req, res) => {
    res.render("signup", {
        layout: "login",
        message: req.flash('signupMessage')
    })
})

// @desc    Login
// @route   GET /
router.get("/login", ensureGuest, (req, res) => {
    res.render("login", {
        layout: "login",
        message: req.flash('loginMessage')
    })
})


// @desc    Dashboard
// @route   GET /dashboard
router.get("/dashboard", ensureAuth, async (req, res) => {
    
    const stories = await Story.find({ user: req.user.id }).lean()
    if (!stories){
        stories = await Story.find({ user: req.session.userId }).lean()
        if (!stories){
            res.render("error/500")
        }
    }
    res.render("dashboard", {
        name: req.user.displayName,
        stories
    })
}) 

// @desc    reset-password-email
// @route   GET /
router.get("/reset-password-email", ensureGuest, (req, res) => {
    res.render("resetPass", {
        layout: "login",
        message: req.flash('updatePasswordMessage')
    })
})

// @desc    reset-password-email
// @route   POST /
router.post("/reset-password-email", ensureGuest, async(req, res) => {
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
            const link = `www.your-app.com/reset-password?token=${token}&user=${user._id}`;
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


router.post("/reset-password", async(req, res)=>{
    const { token, userId, password } = req.body;
    
    try{
        let passwordResetToken = await Token.findOne(userId);
        if (passwordResetToken) {
            const isValid = await bcrypt.compare(token, passwordResetToken.token);
            if (isValid) {
                let  user = await User.findById(userId);
                if (user){
                    user.password = password;
                    await user.save();
                    const mail = sendEmail(
                        user.email,
                        "Password Reset Successfully",
                        {
                            name: user.displayName,
                        },
                        "../views/resetPassword.hbs"
                    );
                    if (mail){
                        await passwordResetToken.remove();
                        res.redirect('/login');
                    }
                }
            }
        }
    } catch(error){
        console.log(error);
        return req.flash('updatePasswordMessage', 'Cannot Reset Password!');
    }
})

module.exports = router


