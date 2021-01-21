const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const catchAsync = require('./utilities/catchAsync');
const ExpressError = require('./utilities/ExpressError');

const { applicationSchema } = require('./schemas.js');

const ejsMate = require('ejs-mate');
const path = require('path');
const Application = require('./models/application');

mongoose.connect('mongodb://localhost:27017/Jobie', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
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
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const validateApplication = (req, res, next) => { // application validation middleware using Joi
    const { error } = applicationSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

app.get('/', (req, res) => {
    res.render('home')
});

// Commented section to test DB connection
// app.get('/submitApplication', async (req, res) => {
//     const application = new Application({ companyName: 'JP Morgan Chase', jobTitle: 'Software Engineer', jobLocation: 'Jersey City, New Jersey', dateApplied: '01/18/2021', status: 'Rejected'})
//     await application.save();
//     res.send(application);
// });

app.get('/stats', catchAsync(async (req, res) => {
    const totalApps = await Application.countDocuments({})
    const acceptedApps = await Application.countDocuments({status:'Accepted'});
    const interviewingApps = await Application.countDocuments({status:'Interviewing'});
    const activeApps = await Application.countDocuments({status:'Active'});
    const rejectedApps = await Application.countDocuments({status:'Rejected'});
    res.render('applications/stats', { totalApps, acceptedApps, interviewingApps, activeApps, rejectedApps });
}));

app.get('/applications', catchAsync(async (req, res) => {
    const applications = await Application.find({});
    res.render('applications/index', { applications } )
}))

app.get('/applications/new', (req, res) => {
    res.render('applications/new')
});

// app.post('/applications', async (req, res) => {
//     res.send(req.body.application);
// });

app.post('/applications', validateApplication, catchAsync(async (req, res, next) => {
    const application = new Application(req.body.application);
    // console.log(application);
    await application.save();
    res.redirect(`/applications/${application._id}`);
}));

app.get('/applications/:id', catchAsync(async (req, res) => {
    const application = await Application.findById(req.params.id);
    res.render('applications/details', { application });
}));

app.get('/applications/:id/edit', catchAsync(async (req, res) => {
    const application = await Application.findById(req.params.id);
    res.render('applications/edit', { application });
}));

app.put('/applications/:id', validateApplication, catchAsync(async (req, res) => {
    const { id } = req.params;
    const application = await Application.findByIdAndUpdate(id, { ...req.body.application });
    res.redirect(`/applications/${application._id}`);
}));

app.delete('/applications/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Application.findByIdAndDelete(id);
    res.redirect('/applications');
}));

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