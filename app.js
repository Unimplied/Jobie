if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
};

const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ExpressError = require('./utilities/ExpressError');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoDBStore = require("connect-mongo")(session);

const applications = require('./routes/applications') // applications routes
const stats = require('./routes/stats'); // stats route
const users = require('./routes/users'); 

const ejsMate = require('ejs-mate');
const path = require('path');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/Jobie';
// process.env.DB_URL || Don't forget to add this to dbUrl

const storeSecret = process.env.STORE_SECRET || 'thisismylocaldevsessionsecret';

mongoose.connect( dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

// mongoose.connect('mongodb://localhost:27017/Jobie', {
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useUnifiedTopology: true,
//     useFindAndModify: false
// });

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database Connected")
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public'))); // serving static assets
app.use(mongoSanitize()); // sanitizes incoming requests, reduces risk of Mongo Injection

const store = new MongoDBStore({
    url: dbUrl,
    secret: storeSecret,
    touchAfter: 24 * 3600 //touch after 1 day
});

store.on("error", function(e) {
    console.log("Session Store Error: ", e);
});

const sessionConfig = {
    store, // mongo is now used to store session store
    name: 'WhichSiteAmI?hahaha',
    secret: storeSecret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
       // secure: true,
        expires: Date.now() * 1000 * 60 * 60, //cookies expire after one hour
        maxAge: 1000 * 60 * 60
    }
    
}
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet({
}));

const scriptSrcUrls = [
    "https://cdn.jsdelivr.net/npm/@popperjs/core@2.5.4/dist/umd/popper.min.js",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/js/bootstrap.min.js",
    "https://stackpath.bootstrapcdn.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
    "https://use.fontawesome.com/releases/v5.15.2/js/all.js",
    "https://kit.fontawesome.com/c07c93b591.js",
    "https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js",
    "https://ajax.googleapis.com/ajax/libs/jquery/1.4/jquery.min.js",
    "https://ajax.googleapis.com/ajax/libs/jqueryui/1.8/jquery-ui.min.js",    
];
const styleSrcUrls = [
    "https://cdn.jsdelivr.net/npm/@popperjs/core@2.5.4/dist/umd/popper.min.js",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/js/bootstrap.min.js",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/css/bootstrap.min.css",
    "https://use.fontawesome.com/releases/v5.15.2/css/svg-with-js.css",
    "https://fonts.googleapis.com/css2?family=Lato:wght@300&display=swap",
    "https://ajax.googleapis.com/ajax/libs/jqueryui/1.8/themes/base/jquery-ui.css"
];
const connectSrcUrls = [
    "https://ka-f.fontawesome.com/releases/v5.15.2/css/free-v4-font-face.min.css?token=c07c93b591",
    "https://ka-f.fontawesome.com/releases/v5.15.2/css/free.min.css?token=c07c93b591",
    "https://ka-f.fontawesome.com/releases/v5.15.2/css/free-v4-shims.min.css?token=c07c93b591",
];
const fontSrcUrls = [
    "https://kit.fontawesome.com/c07c93b591.js",
    "https://fonts.gstatic.com/s/lato/v17/S6u9w4BMUTPHh7USSwaPGQ3q5d0N7w.woff2",
    "https://fonts.gstatic.com/s/lato/v17/S6u9w4BMUTPHh7USSwiPGQ3q5d0.woff2",
    "https://ka-f.fontawesome.com/releases/v5.15.2/webfonts/free-fa-solid-900.woff2",
];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://images.unsplash.com",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser()); // how users are logged in in a session
passport.deserializeUser(User.deserializeUser()); // how users are logged out in a session

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.use((req, res, next) => {
    console.log(req.session);
    res.locals.searchQuery = req.query.search;
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.use('/applications', applications);
app.use('/stats', stats);
app.use('/', users)

app.get('/', (req, res) => {
    res.render('home')
});

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'Something went wrong' } = err;
    res.status( statusCode).render('error', { err });
});

const port = process.env.PORT || 3000;

app.listen(port, ()=> {
    console.log(`Serving on port ${port}`)
});