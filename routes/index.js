const express = require("express")
const router = express.Router()
const { ensureGuest, ensureAuth } = require("../middleware/auth")
const Story = require("../models/Story")
const User = require('../models/User')

// @desc    Signup/Landing page
// @route   GET /
router.get("/", ensureGuest, (req, res) => {
    res.render("signup", {
        layout: "login"
    })
})

// @desc    Signup/Landing page
// @route   POST /
router.post("/", ensureGuest, async(req, res) => {
    try {
        const newUser = new User(req.body);
    
        // If no validation errors, save the user and redirect to the dashboard
        await newUser.save();
        req.session.userId = newUser._id;
        return res.redirect('/dashboard');
    } catch (error) {
        // If there are validation errors, display them on the signup page
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map((err) => err.message);
            console.log(errors);
            return res.render('signup', { errors });
        } else {
            // Use a generic error message for non-validation errors
            console.error(error);
            return res.status(500).send('Something went wrong.');
        }
    }
})

// @desc    Login
// @route   GET /
router.get("/login", ensureGuest, (req, res) => {
    res.render("login", {
        layout: "login"
    })
})

// @desc    Login
// @route   POST /


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

module.exports = router