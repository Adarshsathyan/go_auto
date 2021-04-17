var express = require('express');
var router = express.Router();
const userHelper=require('../helpers/user-helper')
const autoHelper=require('../helpers/auto-helper')
const webPush = require('web-push')

// router.post('/book-notification',(req,res)=>{
//     let subscription = req.body
//     const payload = JSON.stringify({title:"You Have Booking"+req.session.userDetails.name})
//     webPush.sendNotification(subscription,payload).catch(err=>console.log(err))
// })
  
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
            res.render('user/index',{layout:'./user-layout',user:true,userDetails:req.session.userDetails,autos,search:req.session.seacrhAuto,
            noSearch:req.session.noSearch})
            req.session.seacrhAuto=null
            req.session.noSearch=null
            
        })
    }else{
        userHelper.getAllAutos().then((autos)=>{
            res.render('user/index',{layout:'./user-layout',user:true,userDetails:req.session.userDetails,autos,search:req.session.seacrhAuto,
            noSearch:req.session.noSearch
        })
            req.session.seacrhAuto=null
            req.session.noSearch=null
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


//get book auto
router.get('/book-auto/:id',verifyLogin,(req,res)=>{
    userHelper.getAutoDetails(req.params.id).then((autoDetails)=>{
        userHelper.getChargeDetails().then((places)=>{
            res.render('user/book-auto',{user:true,userDetails:req.session.userDetails,layout:'./user-layout',autoDetails,places})
        }) 
    })
})

//confirm booking auto
router.post('/book-auto',verifyLogin,(req,res)=>{
    userHelper.bookAuto(req.body).then((bookId)=>{
        
        req.session.autoBooked=true
        res.redirect('/bookings/'+bookId)
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
    }).catch(()=>{
        res.render('user/bookings',{user:true,userDetails:req.session.userDetails,layout:'./user-layout',noBookings:true})
    })
})

//auto profile
router.get('/auto-profile/:id',verifyLogin,(req,res)=>{
    autoHelper.getProfileDetails(req.params.id).then((details)=>{
        
        userHelper.getAutoDriver(req.params.id).then((autoDriver)=>{
            let bookings = details.drives.length
            
            res.render('user/auto-profile',{auto:true,profileView:true,userDetails:req.session.userDetails
                ,booking:details.booking,drives:details.drives,autoDriver,bookings})
            })
        })
       
   
})


//user profile
router.get('/profile/:id',verifyLogin,(req,res)=>{
    userHelper.getUserDetails(req.params.id).then((userDetails)=>{
        userHelper.rideDetails(req.params.id).then((rides)=>{
            res.render('user/profile',{user:true,userDetails:userDetails,rides,layout:'./user-layout'})
        })
        
    })
    
})

//edit profile
router.post('/edit-profile/:id',verifyLogin,(req,res)=>{
    userHelper.updateProfile(req.body).then((userDetails)=>{
        if(req.files){
            let image=req.files.profile
            image.mv('./public/user/profile-images/'+userDetails._id+'.jpg')
          }
      req.session.userDetails=userDetails
      res.redirect('/profile/'+userDetails._id) 
    })
})

//rate and feedbacks
router.post('/rate',verifyLogin,(req,res)=>{
    console.log(req.body);
    userHelper.sendFeedback(req.body).then(()=>{
        res.redirect('/profile/'+req.body.userId)
    })
})


//report auto
router.post('/report-auto/',verifyLogin,(req,res)=>{
    userHelper.sendReport(req.body).then(()=>{
        res.redirect('/bookings/'+req.body.userId)
    })
})

//auto report by user from the profile view of auto
router.post('/auto-report',verifyLogin,(req,res)=>{
    userHelper.reportAuto(req.body).then(()=>{
        res.redirect('/auto-profile/'+req.body.autoId)
    })
})

//search auto
router.post('/search-auto',(req,res)=>{
    userHelper.searchAuto(req.body).then((autos)=>{
        if(autos[0]){
        req.session.seacrhAuto=autos
        res.redirect('/')
        }else{
        req.session.noSearch=true   
       console.log("reached");
       res.redirect('/')
        }
        
    })
})


//about page
router.get('/about',(req,res)=>{
    res.render('user/about',{layout:'./user-layout',userDetails:req.session.userDetails})
})

//contact page
router.get('/contact',(req,res)=>{
    res.render('user/contact',{layout:'./user-layout',userDetails:req.session.userDetails})
})
module.exports = router;