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
  res.render('auto/login',{loginErr:req.session.loginErr})
  req.session.loginErr=false
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
      res.json({status:true})
    })
  }).catch((err)=>{
    res.json({status:false})
  })
})

//get profile 
router.get('/profile',verifyLogin,(req,res,next)=>{
  res.render('auto/profile',{auto:true})
})

//edit profile form
router.get('/edit-profile',verifyLogin,(req,res,next)=>{
  res.render('auto/edit-profile',{auto:true})
})


router.get('/home',verifyLogin, (req, res, next) =>{
  res.render('auto/index',{auto:true,autoDriver:req.session.autoDriver})
});

router.get('/status', verifyLogin,(req, res, next)=> {
  res.render('auto/status',{auto:true,autoDriver:req.session.autoDriver})
});

router.get('/booking',verifyLogin, (req, res, next)=> {
  autoHelper.getbooking(req.session.autoDriver._id).then((booking)=>{
    req.session.catchErr=null
    if(req.session.autoDriver.drive==="ondrive"){
      req.session.drive=true
    }else{
      req.session.drive=null
    }
    res.render('auto/booking',{auto:true,autoDriver:req.session.autoDriver,booking,drive:req.session.drive})
  }).catch(()=>{
    req.session.catchErr=true
    res.render('auto/booking',{auto:true,autoDriver:req.session.autoDriver,catchErr:req.session.catchErr,drive:req.session.drive})
  })
 
});
 

//get the added places details
router.get('/travel-places',verifyLogin, (req, res, next)=> {
  autoHelper.getPlaces(req.session.autoDriver._id).then((places)=>{
    res.render('auto/places',{auto:true,autoDriver:req.session.autoDriver,places})
  })
});


//add destinations
router.get('/add-destinations',verifyLogin,(req, res, next) =>{
  autoHelper.getKm().then((km)=>{
    res.render('auto/add-destinations',{auto:true,autoDriver:req.session.autoDriver,km})
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
  res.render('auto/users',{auto:true,autoDriver:req.session.autoDriver})
});

//change drive status
router.get('/change-drive/:id',verifyLogin,(req,res)=>{
  autoHelper.changeDriveStatus(req.params.id).then((auto)=>{
    if(auto.drive==="ondrive"){
      req.session.drive=true
      req.session.autoDriver=auto
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
    console.log(req.session.autoDriver);
    res.redirect('/auto/booking')
  })
})
module.exports = router;
