var express = require('express');
var router = express.Router();


//get user home page
router.get('/',(req, res, next)=> {
    res.render('user/index',{layout:'./user-layout',user:true})
  
});



module.exports = router;