const express = require("express")
const router = express.Router()
const { ensureGuest, ensureAuth } = require("../middleware/auth")
const Story = require("../models/Story")

// @desc    Signup/Landing page
// @route   GET /
router.get("/", ensureGuest, (req, res) => {
    res.render("signup", {
        layout: "login"
    })
})

// @desc    Login/Landing page
// @route   GET /
router.get("/login", ensureGuest, (req, res) => {
    res.render("login", {
        layout: "login"
    })
})

// @desc    Dashboard
// @route   GET /dashboard
router.get("/dashboard", ensureAuth, async (req, res) => {
    
    try {
        const stories = await Story.find({ user: req.user.id }).lean()
        res.render("dashboard", {
            name: req.user.firstName,
            stories
        })

    } catch (err) {
        console.error(err)
        res.render("error/500")
    }
}) 

module.exports = router