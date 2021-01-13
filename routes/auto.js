var express = require('express');
var router = express.Router();
let autoHelper= require('../helpers/auto-helper')

//get login page
router.get('/', (req, res, next)=> {
  res.render('auto/login')
});

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
router.get('/payment/:id',(req, res, next)=> {
  res.render('auto/payment',{autoId:req.params.id})
});

//create razorpayorder and take details of registerd auto
router.get('/razorpay/:id',(req,res,next)=>{
  autoHelper.createPaymentOrder(req.params.id).then((response)=>{
    autoHelper.getAuto(req.params.id).then((autoDetails)=>{
      res.json({response:response,autoDetails:autoDetails})
    })
   
  })
});

//verify the payment
router.post('/verify-payment',(req,res,next)=>{
  autoHelper.verifyPayment(req.body).then(()=>{
    autoHelper.changePaidStatus(req.body['order[receipt]']).then(()=>{
      res.json({status:true})
    })
  }).catch((err)=>{
    res.json({status:false})
  })
})

router.get('/home', (req, res, next) =>{
  res.render('auto/index',{auto:true})
});

router.get('/status', (req, res, next)=> {
  res.render('auto/status',{auto:true})
});

router.get('/booking', (req, res, next)=> {
  res.render('auto/booking',{auto:true})
});
router.get('/travel-places', (req, res, next)=> {
  res.render('auto/places',{auto:true})
});
router.get('/add-destinations',(req, res, next) =>{
  res.render('auto/add-destinations',{auto:true})
});
router.get('/users',(req, res, next)=> {
  res.render('auto/users',{auto:true})
});
module.exports = router;
