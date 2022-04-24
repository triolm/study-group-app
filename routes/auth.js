const express = require('express');
const router = express.Router();

const User = require('../models/users');
const { isLoggedIn } = require('../middleware');
const passport = require('passport');
const { UserExistsError, MissingUsernameError, MissingPasswordError } = require('passport-local-mongoose/lib/errors');

catchErr = (function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});


router.get("/register", (req, res) => {
    res.render('register.ejs')
});
router.get("/login", (req, res) => {
    res.render('login.ejs')
});

router.post('/register', catchErr, async (req, res) => {
    try {
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
    } catch (e) {
        console.log(e)
        console.log(typeof (e));
        if (e instanceof UserExistsError) {
            req.flash("warning", "Account with that name already exists.")
        }
        if (e instanceof MissingUsernameError || e instanceof MissingPasswordError) {
            req.flash("warning", "Please fill out all feilds.")
        }
        else {
            req.flash("warning", "Error creating user.")
        }
        res.redirect('/register');
    }
});

router.get('/logout', catchErr, isLoggedIn, async (req, res) => {
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