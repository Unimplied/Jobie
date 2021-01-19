const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');

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

app.get('/', (req, res) => {
    res.render('home')
});

// Commented section to test DB connection
// app.get('/submitApplication', async (req, res) => {
//     const application = new Application({ companyName: 'JP Morgan Chase', jobTitle: 'Software Engineer', jobLocation: 'Jersey City, New Jersey', dateApplied: '01/18/2021', status: 'Rejected'})
//     await application.save();
//     res.send(application);
// });

app.get('/stats', async (req, res) => {
    res.render('applications/stats');
});

app.get('/applications', async (req, res) => {
    const applications = await Application.find({});
    res.render('applications/index', { applications } )
})

app.get('/applications/new', (req, res) => {
    res.render('applications/new')
});

// app.post('/applications', async (req, res) => {
//     res.send(req.body.application);
// });

app.post('/applications', async (req, res) => {
    const application = new Application(req.body.application);
    // console.log(application);
    await application.save();
    res.redirect(`/applications/${application._id}`);
});

app.get('/applications/:id', async (req, res) => {
    const application = await Application.findById(req.params.id);
    res.render('applications/details', { application });
});

app.get('/applications/:id/edit', async (req, res) => {
    const application = await Application.findById(req.params.id);
    res.render('applications/edit', { application });
});

app.put('/applications/:id', async (req, res) => {
    const { id } = req.params;
    const application = await Application.findByIdAndUpdate(id, { ...req.body.application });
    res.redirect(`/applications/${application._id}`);
});

app.delete('/applications/:id', async (req, res) => {
    const { id } = req.params;
    await Application.findByIdAndDelete(id);
    res.redirect('/applications');
});

app.listen(3000, ()=> {
    console.log('Serving on port 3000')
});