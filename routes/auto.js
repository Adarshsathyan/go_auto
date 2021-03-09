var express = require('express');
var router = express.Router();
let autoHelper= require('../helpers/auto-helper')


//verifylogin
let verifyLogin=(req,res,next)=>{
  if(req.session.autoLoggedIn){ 
    next()
  }else{
    res.redirect('/auto')
  }
}


//get login page
router.get('/',(req, res, next)=> {
  if(req.session.autoLoggedIn){
    res.redirect('/auto/home')
  }else{
    res.render('auto/login',{loginErr:req.session.loginErr})
    req.session.loginErr=false
  }
});


//logout
router.get('/logout',(req,res,next)=>{
  req.session.autoLoggedIn=null
  res.redirect('/auto')
})


//login Authentication
router.post('/',(req,res,next)=>{
  autoHelper.autoAuth(req.body).then((response)=>{
    if(response.status){
      req.session.autoDriver=response.auto
      req.session.autoLoggedIn=true
      res.redirect('/auto/home')
    }else{
      req.session.loginErr=true
      res.redirect('/auto')
    }
  })
})


//signup page
router.get('/signup', (req, res, next)=> {
  res.render('auto/signup',{error:req.session.autosignupErr})
  req.session.autosignupErr=false
});


//signup post actions
router.post('/signup', (req, res, next) =>{
  autoHelper.signUp(req.body).then((response)=>{
    if(response.status){
      req.session.autoDriver=response.autoDriver
      req.session.autoLoggedIn=true
      if(req.files){
        if(req.files.rcbook){
          let rcbook=req.files.rcbook
          rcbook.mv('./public/auto/auto-rcbooks/'+response.autoDriver._id+'.jpg')
        }if(req.files.lisence){
          let lisence = req.files.lisence
          lisence.mv('./public/auto/auto-lisences/'+response.autoDriver._id+'.jpg')
        }if(req.files.autophoto){
          let photo = req.files.autophoto
          photo.mv('./public/auto/auto-profile/'+response.autoDriver._id+'.jpg')
        }
      }
      res.redirect('/auto/payment/'+response.autoDriver._id)
    }else{
      req.session.autosignupErr=true
      res.redirect('/auto/signup')
    }
  })
});


//payment for registration
router.get('/payment/:id',verifyLogin,(req, res, next)=> {
  res.render('auto/payment',{autoId:req.params.id})
});


//create razorpayorder and take details of registerd auto
router.get('/razorpay/:id',verifyLogin,(req,res,next)=>{
  autoHelper.createPaymentOrder(req.params.id).then((response)=>{
    autoHelper.getAuto(req.params.id).then((autoDetails)=>{
      res.json({response:response,autoDetails:autoDetails})
    })
  })
});


//verify the payment
router.post('/verify-payment',verifyLogin,(req,res,next)=>{
  autoHelper.verifyPayment(req.body).then(()=>{
    autoHelper.changePaidStatus(req.body['order[receipt]']).then(()=>{
      req.session.autoRequest=true
      res.json({status:true})
    })
  }).catch((err)=>{
    res.json({status:false})
  })
})

//get profile 
router.get('/profile',verifyLogin,(req,res,next)=>{
  autoHelper.getProfileDetails(req.session.autoDriver._id).then((details)=>{
    res.render('auto/profile',{auto:true,autoBooked:req.session.autoBooked,autoDriver:req.session.autoDriver
      ,booking:details.booking,drives:details.drives})
  })
  
  
})

//edit profile form
router.get('/edit-profile',verifyLogin,(req,res,next)=>{
  res.render('auto/edit-profile',{auto:true,autoBooked:req.session.autoBooked,autoDriver:req.session.autoDriver})
})

//update profile
router.post('/edit-profile/:id',verifyLogin,(req,res)=>{
  autoHelper.updateProfile(req.params.id,req.body).then((auto)=>{
    req.session.autoDriver=auto
    if(req.files){
      let image=req.files.profile
      image.mv('./public/auto/auto-profile/'+req.params.id+'.jpg')
    }
    res.redirect('/auto/profile')
  })
})


//show dashboard
router.get('/home',verifyLogin, (req, res, next) =>{
  res.render('auto/index',{auto:true,autoDriver:req.session.autoDriver,
    autoBooked:req.session.autoBooked,changedPass:req.session.autoPassChange})
    req.session.autoPassChange=null
});

router.get('/status', verifyLogin,(req, res, next)=> {
  autoHelper.getAuto(req.session.autoDriver._id).then((auto)=>{
    if(auto.drive==="Available"){
       available=true
       offline = false
    }else if(auto.drive==="Ondrive"){
      available=true
      offline=false
    }else{
      available=false
      offline=true
    }
    res.render('auto/status',{auto:true,autoDriver:req.session.autoDriver,autoBooked:req.session.autoBooked,available:available
      ,offline:offline})
  })
  
});

router.get('/booking',verifyLogin, (req, res, next)=> {
  autoHelper.getbooking(req.session.autoDriver._id).then((booking)=>{
    
    req.session.catchErr=null
    if(req.session.autoDriver.drive==="Ondrive"){
      req.session.drive=true
    }else{
      req.session.drive=null
    }
    res.render('auto/booking',{auto:true,autoDriver:req.session.autoDriver,booking,drive:req.session.drive,autoBooked:req.session.autoBooked})
  }).catch(()=>{
    req.session.catchErr=true
    res.render('auto/booking',{auto:true,autoDriver:req.session.autoDriver,catchErr:req.session.catchErr,drive:req.session.drive})
  })
 
});
 

//get the added places details
router.get('/travel-places',verifyLogin, (req, res, next)=> {
  autoHelper.getPlaces(req.session.autoDriver._id).then((places)=>{
    res.render('auto/places',{auto:true,autoDriver:req.session.autoDriver,places,autoBooked:req.session.autoBooked})
  })
});


//add destinations
router.get('/add-destinations',verifyLogin,(req, res, next) =>{
  autoHelper.getKm().then((km)=>{
    res.render('auto/add-destinations',{auto:true,autoDriver:req.session.autoDriver,km,autoBooked:req.session.autoBooked})
  })
});


//post for adding destinations
router.post('/add-destinations',verifyLogin,(req,res,next)=>{
  autoHelper.addPlace(req.body).then(()=>{
    res.redirect('/auto/travel-places')
  })
})

//take charge
router.post('/take-charge',verifyLogin,(req,res,next)=>{
  autoHelper.takeCharge(req.body).then((charge)=>{
    res.json(charge)
  })
})

//view users travlled
router.get('/users',verifyLogin,(req, res, next)=> {
  autoHelper.getUsersTravelled(req.session.autoDriver._id).then((drives)=>{
    res.render('auto/users',{auto:true,autoDriver:req.session.autoDriver,autoBooked:req.session.autoBooked,drives})
  }).catch(()=>{
    res.render('auto/users',{auto:true,autoDriver:req.session.autoDriver,autoBooked:req.session.autoBooked,drives})
  })
 
});

//change drive status
router.get('/change-drive/:id',verifyLogin,(req,res)=>{
  autoHelper.changeDriveStatus(req.params.id).then((auto)=>{
    if(auto.drive==="Ondrive"){
      req.session.drive=true
      req.session.autoDriver=auto
      req.session.autoBooked=null
      res.json({status:true})
    }else{
      res.json({status:false})
    }
  })
})

//complete drive
router.get('/completed/:id',verifyLogin,(req,res)=>{
  autoHelper.completeDrive(req.params.id).then((auto)=>{
    req.session.drive=null
    req.session.autoDriver=auto
    res.redirect('/auto/booking')
  })
})

//invoice for payment
router.get('/invoice/:id',verifyLogin,(req,res)=>{
  autoHelper.getAuto(req.params.id).then((autoDetails)=>{
    if(autoDetails.status==="2"){
      req.session.confirmed=true
    }else{
      req.session.confirmed=null
    }
    res.render('auto/invoice',{autoDetails,confirmed:req.session.confirmed})
  })
  
})

//report user
router.post('/report-user',verifyLogin,(req,res)=>{
  autoHelper.reportUser(req.body).then(()=>{
    res.redirect('/auto/booking')
  })
})
 
//change- status or drive
router.post('/change-status/:id',(req,res)=>{
 
  autoHelper.changeStatus(req.params.id,req.body).then((response)=>{
    autoHelper.getAuto(req.params.id).then((auto)=>{
      req.session.autoDriver=auto
      res.json(response)
    })
    
  })
})

//edit the places
router.get('/edit-place/:id',verifyLogin,(req,res)=>{
  autoHelper.getPlaceDetails(req.params.id).then((charges)=>{
    autoHelper.getKm().then((km)=>{
      res.render('auto/edit-places',{auto:true,autoDriver:req.session.autoDriver,autoBooked:req.session.autoBooked,charges,km})
    })
    
  })
  
})

//uapdete the edited travel charges
router.post('/edit-place/:id',(req,res)=>{
  autoHelper.updatePlace(req.params.id,req.body).then(()=>{
    res.redirect('/auto/travel-places')
  })
})

//change passwword manually typing old password
//this is get page
router.get('/change-pass/',verifyLogin,(req,res)=>{
  res.render('auto/change-pass',{auto:true,autoDriver:req.session.autoDriver,autoBooked:req.session.autoBooked
    ,passChangeErr:req.session.passChangeErr})
    req.session.passChangeErr=null
})

//to handle chAange pass request
router.post('/change-pass',verifyLogin,(req,res)=>{
  autoHelper.changePass(req.body).then((response)=>{
    if(response.status){
      req.session.autoPassChange=true
      res.redirect('/auto/home')
    }else{
      req.session.passChangeErr=true
      res.redirect('/auto/change-pass')
    }
  })
})

//forgot password landing page
router.get('/forgot-pass',(req,res)=>{
  res.render('auto/forgot-pass',{otpErr:req.session.otpErr})
  req.session.otpErr=null
})

//post function for forgot password
router.post('/forgot-pass',(req,res)=>{
  autoHelper.sendOtp(req.body).then((response)=>{
    if(response.data.status){
      req.session.mobile=response.data.to
      req.session.PassChanger=response.auto
      req.session.otpSent=true
      res.redirect('/auto/verify-otp')
    }else{
      req.session.otpErr=true
      res.redirect('/auto/forgot-pass')
    }
   
  })
})

//verify otp landing page
router.get('/verify-otp',(req,res)=>{
  res.render('auto/verify-otp')
})

router.post('/verify',(req,res)=>{
  autoHelper.verifyOtp(req.session.mobile,req.body).then((response)=>{
    if(response.valid){
      req.session.verifiedOtp=true
      res.redirect('/auto/new-pass')
    }
  })
})

//page for new password
router.get('/new-pass',(req,res)=>{
  res.render('auto/new-pass',{details:req.session.PassChanger})
})

//change password based on forgot passowrd
router.post('/change-forgot-pass',(req,res)=>{
autoHelper.changeForgotPass(req.body).then((response)=>{
  if(response.status){
    req.session.autoPassChange=true
    res.redirect('/auto')
  }else{
    req.session.passChangeErr=true
    res.redirect('/auto/new-pass')
  }
})
})
module.exports = router;
