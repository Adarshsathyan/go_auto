var express = require('express');
var router = express.Router();
const userHelper=require('../helpers/user-helper')
const verifyLogin=(req,res,next)=>{
    if(req.session.userLoggedIn){
        next()
    }else{
        res.redirect('/login')
    }
}

//get user home page
router.get('/',(req, res, next)=> {
    if(req.session.userLoggedIn){
        userHelper.getAuto(req.session.userDetails.location).then((autos)=>{
            res.render('user/index',{layout:'./user-layout',user:true,userDetails:req.session.userDetails,autos})
        })
    }else{
        userHelper.getAllAutos().then((autos)=>{
            res.render('user/index',{layout:'./user-layout',user:true,userDetails:req.session.userDetails,autos})
        })   
    }
});


//select which type of login
router.get('/select-login',(req, res, next)=> {
    res.render('user/select-login',{layout:'./user-layout',user:true})
});

//login page
router.get('/login',(req,res,next)=>{
    res.render('user/login',{layout:null,err:req.session.userErr})
    req.session.userErr=false
});

//login authentication post request
router.post('/login',(req,res)=>{
    userHelper.loginAuthetication(req.body).then((response)=>{
        if(response.status){
            req.session.userLoggedIn=true
            req.session.userDetails=response.user
            res.redirect('/')
        }else{
            req.session.userErr=true
            res.redirect('/login')
        }
    })
})

//signup page for user
router.get('/signup',(req,res,next)=>{
    res.render('user/signup',{layout:null,err:req.session.userErr})
    req.session.userErr=false
});


//signup post function to insert details of signed user
router.post('/signup',(req,res)=>{
    userHelper.userSignUp(req.body).then((response)=>{
        if(response.status){
            req.session.userDetails=response.user
            req.session.userLoggedIn=true
            res.redirect('/')
        }else{
            req.session.userErr=true
            res.redirect('/signup')
        }
    })
})

//logout
router.get('/logout',(req,res)=>{
    req.session.userLoggedIn=null
    req.session.userDetails=null
    res.redirect('/')
});


//book auto
router.get('/book-auto/:id',verifyLogin,(req,res)=>{
    userHelper.getAutoDetails(req.params.id).then((autoDetails)=>{
        userHelper.getChargeDetails().then((places)=>{
            res.render('user/book-auto',{user:true,userDetails:req.session.userDetails,layout:'./user-layout',autoDetails,places})
        }) 
    })
})

//book auto
router.post('/book-auto',verifyLogin,(req,res)=>{
    userHelper.bookAuto(req.body).then(()=>{
        res.redirect('/')
    })
})


//to get charge of selected destination
router.post('/charge',verifyLogin,(req,res)=>{
    userHelper.getCharge(req.body).then((charge)=>{
        res.json(charge.charge)
    })
})

//get bookings
router.get('/bookings/:id',verifyLogin,(req,res)=>{
    userHelper.getBookings(req.params.id).then((response)=>{

        res.render('user/bookings',{user:true,userDetails:req.session.userDetails,layout:'./user-layout',booking:response.booking,
    auto:response.auto})
    })
})

//auto profile
router.get('/auto-profile/:id',verifyLogin,(req,res)=>{
    res.render('user/auto-profile',{auto:true,profileView:true})
})

module.exports = router;