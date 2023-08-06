const express = require("express")
const router = express.Router()
const { ensureGuest, ensureAuth } = require("../middleware/auth")
const Story = require("../models/Story")
const User = require('../models/User')
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

// @desc    Login
// @route   GET /
router.get("/confirm-email", ensureAuth, (req, res) => {
    res.render("mailConf", {
        layout: "login",
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


// @desc    reset-password
// @route   POST /
router.get("/confirm-mail", ensureAuth, async(req, res)=>{

    const { token, user } = req.query;
    
    try{
        let userToken = await Token.findOne({userId: user});
        if (userToken) {
            const isValid = bcrypt.compare(token, userToken.token);
            if (isValid) {
                let  userData = await User.findById(user);
                if (userData){
                    userData.verified = true;
                    await userData.save();
                    const mail = sendEmail(
                        userData.email,
                        "Account Created Successfully",
                        {
                            name: userData.displayName,
                        },
                        "../views/welcome.hbs"
                    );
                    if (mail){
                        await userToken.remove();
                        res.redirect('/dashboard');
                    }
                }
            }
        }
    } catch(error){
        console.log(error);
        res.render("error/500")
    }
})



// @desc    reset-password
// @route   POST /
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


