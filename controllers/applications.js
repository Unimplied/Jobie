const Application = require('../models/application');
const user = require('../models/user');

module.exports.index = async (req, res) => {
    function escapeRegex(text) { // fuzzy search regex
        return text.replace( /[-[\]{}*+?.,\\^$|#\s]/g, "\\$&" );
    };

    const reqUser = await user.findOne({ username: req.user.username });
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        const applications = await Application.find({ owner: reqUser._id, companyName: regex});
        res.render('applications/index', { applications } );

    } else {
    const applications = await Application.find({ owner: reqUser._id});
    // const applications = await Application.find({}).populate('owner');
    res.render('applications/index', { applications } );
    }
    // res.send(applications)
};

module.exports.renderNewForm = (req, res) => {
    res.render('applications/new')
};

module.exports.newApplication = async (req, res, next) => {
    const application = new Application(req.body.application); 
    application.owner = req.user._id;     
    await application.save();
    req.flash('success', 'Successfully made a new application')
    res.redirect(`/applications/${application._id}`);
};

module.exports.displayApplication = async (req, res) => {
    const reqUser = await user.findOne({ username: req.user.username });
    const application = await Application.findById(req.params.id);

    if(!application){
        req.flash('error', 'Cannot find that application. Was it deleted?')
        return res.redirect('/applications')
    } else {const { owner } = application;
    
    if( JSON.stringify(reqUser._id) != JSON.stringify(owner) ) {  // if current user's ID is not equal to the owner ID of the application
        req.flash('error', 'Access denied')
        return res.redirect('/applications')
    } else {
        return res.render('applications/details', { application });
    }
    }

    // console.log( reqUser._id, owner)
    // res.send(owner);
    // owner :"600a24f4a896690e4dc19e98"
    // reqUser._id : "600a24f4a896690e4dc19e98"
    // alex1 reqUser._id: "600a33ac671c3711baf0a224"
    
};

module.exports.renderEditForm = async (req, res) => {
    const application = await Application.findById(req.params.id);
    res.render('applications/edit', { application });
};

module.exports.editApplication = async (req, res) => {
    const { id } = req.params;
    const application = await Application.findByIdAndUpdate(id, { ...req.body.application });
    req.flash('success', 'Successfully edited application');
    res.redirect(`/applications/${application._id}`);
};

module.exports.deleteApplication = async (req, res) => {
    const { id } = req.params;
    await Application.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted application');
    res.redirect('/applications');
};