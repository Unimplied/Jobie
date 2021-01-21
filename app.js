const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ExpressError = require('./utilities/ExpressError');
const session = require('express-session');
const flash = require('connect-flash');

const applications = require('./routes/applications') // applications routes
const stats = require('./routes/stats') // stats route


const ejsMate = require('ejs-mate');
const path = require('path');

mongoose.connect('mongodb://localhost:27017/Jobie', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

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

const sessionConfig = {
    secret: 'secret',
    resave: false,
    saveUninitialized: true.valueOf,
    cookie: {
        httpOnly: true,
        expires: Date.now() * 1000 * 60 * 60, //cookies expire after one hour
        maxAge: 1000 * 60 * 60
    }
    
}
app.use(session( sessionConfig));
app.use(flash());

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.use('/applications', applications);
app.use('/stats', stats);


app.get('/', (req, res) => {
    res.render('home')
});

// Commented section to test DB connection
// app.get('/submitApplication', async (req, res) => {
//     const application = new Application({ companyName: 'JP Morgan Chase', jobTitle: 'Software Engineer', jobLocation: 'Jersey City, New Jersey', dateApplied: '01/18/2021', status: 'Rejected'})
//     await application.save();
//     res.send(application);
// });

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'Something went wrong' } = err;
    res.status( statusCode).render('error', { err });
});

app.listen(3000, ()=> {
    console.log('Serving on port 3000')
});