var express = require('express');
var router = express.Router();
const adminHelper=require('../helpers/admin-helper')

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.adminLoggedIn){
    res.redirect('/admin/home')
  }else{
    res.render('admin/login',{adminErr:req.session.adminErr} );
    req.session.adminErr=false
  }
  
});
router.post('/', function(req, res, next) {
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

router.get('/home', function(req, res, next) {
  res.render('admin/index',{admin:true} );
});

router.get('/auto', function(req, res, next) {
  res.render('admin/auto-drivers',{admin:true});
});

router.get('/users', function(req, res, next) {
  res.render('admin/users',{admin:true} );
});

router.get('/blockedauto', function(req, res, next) {
  res.render('admin/blocked_auto', {admin:true});
});

router.get('/blockeduser', function(req, res, next) {
  res.render('admin/blocked_user', {admin:true});
});

router.get('/status', function(req, res, next) {
  res.render('admin/auto-status',{admin:true} );
});

router.get('/feedback', function(req, res, next) {
  res.render('admin/feedback',{admin:true} );
});

router.get('/travelcharge', function(req, res, next) {
  res.render('admin/travel-charge',{admin:true} );
});

router.get('/addtravelrate', function(req, res, next) {
  res.render('admin/add-travel-charge',{admin:true} );
});

module.exports = router;
