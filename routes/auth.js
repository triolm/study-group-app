const express = require('express');
const router = express.Router();

const User = require('../models/users');
const { isLoggedIn } = require('../middleware');
const passport = require('passport');

router.get("/register", (req, res) => {
    res.render('register.ejs')
});
router.get("/login", (req, res) => {
    res.render('login.ejs')
});

router.post('/register', async (req, res) => {
    const { email, username, password, isTeacher } = req.body;
    isStudent = !isTeacher;
    const user = new User({ email, username, isStudent })
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, err => {
        if (err) return next(err);
        res.redirect('/');
    })
    req.flash('info', 'Welcome!')
    passport.authenticate()
});

router.get('/logout', isLoggedIn, async (req, res) => {
    await req.logout();
    req.session.user_id = res.user;
    req.flash("success", "Logged out.")
    res.redirect('/')
});

router.post('/login',
    passport.authenticate('local', { failureRedirect: '/login', failureFlash: 'Username and password do not match.' }),
    (req, res) => {
        req.flash("success", "Logged in sucessfully.")
        req.session.redirect ? res.redirect(req.session.redirect) : res.redirect('/')
    });

module.exports = router;