var express = require('express');
var router = express.Router();
const userHelper = require('../helpers/user-helper');
const autoHelper = require('../helpers/auto-helper');

const verifyLogin = (req, res, next) => {
    if (req.session.userLoggedIn) {
        next();
    } else {
        res.redirect('/login');
    };
};

//get user home page
router.get('/', (req, res, next) => {
    if (req.session.userLoggedIn) {
        userHelper.getAuto(req.session.userDetails.location).then((autos) => {
            res.render('user/index', {
                layout: './user-layout', user: true, userDetails: req.session.userDetails,
                autos, search: req.session.seacrhAuto,
                noSearch: req.session.noSearch, title: "Home"
            });
            req.session.seacrhAuto = null;
            req.session.noSearch = null;
        });
    } else {
        userHelper.getAllAutos().then((autos) => {
            res.render('user/index', {
                layout: './user-layout', user: true, userDetails: req.session.userDetails,
                autos, search: req.session.seacrhAuto,
                noSearch: req.session.noSearch, title: "Home"
            });
            req.session.seacrhAuto = null;
            req.session.noSearch = null;
        });
    };
});


//select which type of login
router.get('/select-login', (req, res, next) => {
    res.render('user/select-login', { layout: './user-layout', user: true, title: "Select Login" });
});

//login page
router.get('/login', (req, res, next) => {
    if (req.session.userLoggedIn) {
        res.redirect('/');
    } else {
        res.render('user/login', { layout: null, err: req.session.userErr, userPassChange: req.session.userPassChange, title: "Login" });
        req.session.userPassChange = null;
        req.session.userErr = false;
    };

});

//login authentication post request
router.post('/login', (req, res) => {
    userHelper.loginAuthetication(req.body).then((response) => {
        if (response.status) {
            req.session.userLoggedIn = true;
            req.session.userDetails = response.user;
            res.redirect('/');
        } else {
            req.session.userErr = true;
            res.redirect('/login');
        };
    });
});

//signup page for user
router.get('/signup', (req, res, next) => {
    if (req.session.userLoggedIn) {
        res.redirect('/');
    } else {
        res.render('user/signup', { layout: null, err: req.session.userErr, title: "Signup" });
        req.session.userErr = false;
    };

});


//signup post function to insert details of signed user
router.post('/signup', (req, res) => {

    userHelper.userSignUp(req.body).then((response) => {

        if (response.status) {
            if (req.files) {
                let image = req.files.image;
                image.mv('./public/user/profile-images/' + response.user._id + '.jpg');
            }
            req.session.userDetails = response.user;
            req.session.userLoggedIn = true;

            res.redirect('/');
        } else {
            req.session.userErr = true;
            res.redirect('/signup');
        };
    });
});

//logout
router.get('/logout', (req, res) => {
    req.session.userLoggedIn = null;
    req.session.userDetails = null;
    res.redirect('/');
});


//get book auto
router.get('/book-auto/:id', verifyLogin, (req, res) => {
    userHelper.getAutoDetails(req.params.id).then(async (autoDetails) => {

        let rating = await autoHelper.getRating(req.params.id);
        let userBooking = await userHelper.getUserBooking(req.session.userDetails._id);
        if (userBooking) {
            if (userBooking.userId === req.session.userDetails._id) {
                userBooking = true;
            } else {
                userBooking = false;
            };
        } else {
            userBooking = false;
        };

        userHelper.getChargeDetails(req.params.id).then((places) => {
            res.render('user/book-auto', {
                user: true, userDetails: req.session.userDetails,
                layout: './user-layout', autoDetails, places, rating, title: "Book auto", userBooking
            });
        });
    });
});

//confirm booking auto
router.post('/book-auto', verifyLogin, (req, res) => {
    userHelper.bookAuto(req.body).then((bookId) => {
        req.session.autoBooked = true;
        res.redirect('/bookings/' + bookId);
    });
});


//to get charge of selected destination
router.post('/charge', verifyLogin, (req, res) => {
    userHelper.getCharge(req.body).then((charge) => {
        res.json(charge.charge);
    });
});

//get bookings
router.get('/bookings/:id', verifyLogin, (req, res) => {
    userHelper.getBookings(req.params.id).then(async (response) => {
        let rating = await autoHelper.getRating(response.auto._id);
        res.render('user/bookings', {
            user: true, userDetails: req.session.userDetails,
            layout: './user-layout', booking: response.booking, title: "Bookings",
            auto: response.auto, rating
        });
    }).catch(() => {
        res.render('user/bookings', {
            user: true, userDetails: req.session.userDetails,
            layout: './user-layout', noBookings: true, title: "Bookings"
        });
    });
});

//auto profile
router.get('/auto-profile/:id', verifyLogin, (req, res) => {
    autoHelper.getProfileDetails(req.params.id).then((details) => {

        userHelper.getAutoDriver(req.params.id).then(async (autoDriver) => {
            let bookings = details.drives.length;
            let rating = await autoHelper.getRating(req.params.id);
            res.render('user/auto-profile', {
                auto: true, profileView: true, userDetails: req.session.userDetails
                , booking: details.booking, drives: details.drives, autoDriver, bookings, rating, title: "Auto profile"
            });
        });
    });
});


//user profile
router.get('/profile/:id', verifyLogin, (req, res) => {
    userHelper.getUserDetails(req.params.id).then((userDetails) => {
        userHelper.rideDetails(req.params.id).then((rides) => {
            res.render('user/profile', { user: true, userDetails: userDetails, rides, layout: './user-layout', title: "Profile" });
        });
    });
});

//edit profile
router.post('/edit-profile/:id', verifyLogin, (req, res) => {
    userHelper.updateProfile(req.body).then((userDetails) => {
        if (req.files) {
            let image = req.files.profile;
            image.mv('./public/user/profile-images/' + userDetails._id + '.jpg');
        };
        req.session.userDetails = userDetails;
        res.redirect('/profile/' + userDetails._id);
    });
});

//rate and feedbacks
router.post('/rate', verifyLogin, (req, res) => {
    userHelper.sendFeedback(req.body).then(() => {
        res.redirect('/profile/' + req.body.userId);
    });
});


//report auto
router.post('/report-auto/', verifyLogin, (req, res) => {
    userHelper.sendReport(req.body).then(() => {
        res.redirect('/bookings/' + req.body.userId);
    });
});

//auto report by user from the profile view of auto
router.post('/auto-report', verifyLogin, (req, res) => {
    userHelper.reportAuto(req.body).then(() => {
        res.redirect('/auto-profile/' + req.body.autoId);
    });
});

//search auto
router.post('/search-auto', (req, res) => {
    userHelper.searchAuto(req.body).then((autos) => {
        if (autos[0]) {
            req.session.seacrhAuto = autos;
            res.redirect('/');
        } else {
            req.session.noSearch = true;
            res.redirect('/');
        };

    });
});


//about page
router.get('/about', (req, res) => {
    res.render('user/about', { layout: './user-layout', userDetails: req.session.userDetails, title: "About" });
});

//contact page
router.get('/contact', (req, res) => {
    res.render('user/contact', {
        layout: './user-layout', userDetails: req.session.userDetails,
        contacted: req.session.contacted, title: "Contact"
    });
    req.session.contacted = null;
});


//contact page information
router.post('/contact', (req, res) => {
    userHelper.contactAdmin(req.body).then(() => {
        req.session.contacted = true;
        res.redirect('/contact');
    });
});

//forgot password
router.get('/forgot-pass', (req, res) => {
    res.render('user/forgot-pass', { layout: null, otpErr: req.session.otpErr, title: "Forgot Password" });
    req.session.otpErr = null;
});

//forgot pass post request
router.post('/forgot-pass', (req, res) => {
    userHelper.sentOtp(req.body).then((response) => {
        if (response.data.status) {
            req.session.mobile = response.data.to;
            req.session.userPassChanger = response.user;
            req.session.otpSent = true;
            res.redirect('/verify-otp');
        } else {
            req.session.otpErr = true;
            res.redirect('/forgot-pass');
        };
    });
});

//verifyotp get page
router.get('/verify-otp', (req, res) => {
    if (req.session.otpSent) {
        res.render('user/verify-otp', { layout: null, wrongotp: req.session.wrongOtp, title: "Verify OTP" });
        req.session.wrongOtp = null;
    } else {
        res.redirect('/forgot-pass');
    };

});

//router for posting the otp
router.post('/verify-otp', (req, res) => {
    userHelper.verifyOtp(req.session.mobile, req.body).then((response) => {
        if (response.valid) {
            req.session.verifiedOtp = true;
            res.redirect('/new-pass');
        } else {
            req.session.wrongOtp = true;
            res.redirect('/verify-otp');
        };
    });
});

//new password for fogotted passowrd
router.get('/new-pass', (req, res) => {
    if (req.session.verifiedOtp) {
        res.render('user/new-pass', {
            layout: null, details: req.session.userPassChanger,
            changeErr: req.session.changeErr, title: "New Password"
        });
        req.session.changeErr = null;
    } else {
        res.render('/error');
    };

});

//new password post request
router.post('/new-pass', (req, res) => {
    userHelper.changeForgotPassword(req.body).then((response) => {
        if (response.status) {
            req.session.userPassChange = true;
            res.redirect('/login');
        } else {
            req.session.changeErr = true;
            res.redirect('/new-pass');
        };
    });
});


//change password
router.post('/change-pass', verifyLogin, (req, res) => {
    userHelper.changePassword(req.body).then((response) => {

        if (response.status) {
            res.json({ status: true });
        } else {
            res.json({ status: false });
        };
    });

});

module.exports = router;