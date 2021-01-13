var express = require('express');
var router = express.Router();
const adminHelper=require('../helpers/admin-helper')

//to check whether admin is logged in
let verifyLogin=(req,res,next)=>{
  if(req.session.adminLoggedIn){
    next()
  }else{
    res.redirect('/admin')
  }
}


// get login page
router.get('/', (req,res,next)=>{
  if(req.session.adminLoggedIn){
    res.redirect('/admin/home')
  }else{
    res.render('admin/login',{adminErr:req.session.adminErr} );
    req.session.adminErr=false
  }
  
});

//login authentication
router.post('/', (req,res,next)=>{
  adminHelper.adminLogin(req.body).then((response)=>{
    if(response.status){
      req.session.adminLoggedIn=true
      req.session.admin=response.admin
      res.redirect('/admin/home')
    }else{
      req.session.adminErr=true
      res.redirect('/admin')
    }
  }) 
});

//logout admin
router.get('/logout',(req,res,next)=>{
  req.session.adminLoggedIn=null
  res.redirect('/admin')
});

//view home page
router.get('/home',verifyLogin, (req,res,next)=>{
  res.render('admin/index',{admin:true} );
});

//view autos
router.get('/auto',verifyLogin,(req,res,next)=>{
  res.render('admin/auto-drivers',{admin:true});
});

//view users
router.get('/users',verifyLogin, (req,res,next)=>{
  res.render('admin/users',{admin:true} );
});

//view blocked autos
router.get('/blockedauto',verifyLogin,(req,res,next)=>{
  res.render('admin/blocked_auto', {admin:true});
});

//view blocked user
router.get('/blockeduser',verifyLogin, (req,res,next)=> {
  res.render('admin/blocked_user', {admin:true});
});

//view auto statuses
router.get('/status',verifyLogin, (req,res,next)=>{
  res.render('admin/auto-status',{admin:true} );
});

//view feedbacks & reports
router.get('/feedback',verifyLogin, (req,res,next)=>{
  res.render('admin/feedback',{admin:true} );
});

//view the trave charges
router.get('/travelcharge',verifyLogin, (req,res,next)=>{
  res.render('admin/travel-charge',{admin:true} );
});

//add travel charges
router.get('/addtravelrate',verifyLogin, (req,res,next)=>{
  res.render('admin/add-travel-charge',{admin:true} );
});

module.exports = router;
