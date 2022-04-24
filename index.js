const express = require('express');
const app = express();
const session = require('express-session');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const User = require('./models/users');
const GroupRequest = require('./models/request');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const flash = require('flash');
require('dotenv').config();
port = process.env.PORT || 3000;

// const noteRoutes = require('./routes/notes')
// const profileRoutes = require('./routes/profile')
const authRoutes = require('./routes/auth')

const mongoose = require('mongoose');
const path = require('path');
const { isLoggedIn, } = require('./middleware');

mongoose.connect('mongodb://localhost:27017/studygroup', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("connection open")
    })
    .catch(err => {
        console.log(err)
    })

mongoose.set('useFindAndModify', false);

const sessionConfig = {
    secret: 'secret',
    proxy: true,
    resave: true,
    saveUninitialized: true
}

mongoose.set('useCreateIndex', true);

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(session(sessionConfig))
app.use((req, res, next) => {
    req.flash = [];
    next();
})
app.use(flash())
app.use(passport.initialize());
app.use(passport.session());

// app.use(cookieParser(sessionConfig.secret))
// app.use(express.bodyParser());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    for (let i of res.locals.flash) {
        if (i.type == 'error') {
            i.type = 'danger'
        }
    }
    next();
})

app.engine('ejs', ejsMate)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use('/', authRoutes)

app.get("/", isLoggedIn, async (req, res) => {
    let query = req.query.search;
    let rooms = await GroupRequest.find(query ? {
        className: { "$regex": query, "$options": "i" }
    } : {}).populate("author");
    res.render('home', { rooms: rooms, id: req.user._id });
})

app.get("/createrequest", isLoggedIn, (req, res) => {
    res.render('newreq')
})

app.post("/createrequest", isLoggedIn, (req, res) => {
    const { title, className, department, date, location, isVirtual } = req.body;
    groupReq = new GroupRequest({ location, title, className, department, isVirtual: !!isVirtual, date, author: req.user._id, createDate: Date.now(), participants: [req.user._id] });
    groupReq.save();
    res.redirect('/mygroups');
})
app.post("/addroom/", isLoggedIn, async (req, res) => {
    const toAdd = await GroupRequest.findById(req.body.id);
    toAdd.participants.push(req.user._id);
    toAdd.save();
    req.flash("success", "Sucessfully joined room.")
    res.redirect('/mygroups')
})

app.get("/mygroups", isLoggedIn, async (req, res) => {
    rooms = await GroupRequest.find({
        participants: req.user._id

    }).populate("participants").populate("author");
    res.render('mystudygroups', { rooms })
})

app.all('*', (req, res) => {
    res.send("error")
})

app.listen(port, () => {
    console.log(`listening on port ${port}`)
});