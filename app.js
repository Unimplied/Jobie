const express = require('express');
const mongoose = require('mongoose');
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

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
    res.render('home')
});

// Commented section to test DB connection
// app.get('/submitApplication', async (req, res) => {
//     const application = new Application({ companyName: 'JP Morgan Chase', jobTitle: 'Software Engineer', jobLocation: 'Jersey City, New Jersey', dateApplied: '01/18/2021', status: 'Rejected'})
//     await application.save();
//     res.send(application);
// });

app.get('/applications', async (req, res) => {
    const applications = await Application.find({});
    res.render('applications/index', {applications} )
})

app.listen(3000, ()=> {
    console.log('Serving on port 3000')
});