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
  adminHelper.getAllAuto().then((autos)=>{
    res.render('admin/auto-drivers',{admin:true,autos,deleted:req.session.deleted});
    req.session.deleted=false
  })
});

//block Auto
router.get('/block-auto/:id',verifyLogin,(req,res,next)=>{
  adminHelper.blockAuto(req.params.id).then((blocked)=>{
    if(blocked.block==="1"){
     res.redirect('/admin/auto')
    }
    else{
      res.redirect('/admin/auto')
    }
  }).catch((err)=>{
    res.redirect('/admin/auto')
  })
})

//unblock user
router.get('/unblock-auto/:id',verifyLogin,(req,res,next)=>{
  
  adminHelper.unblockAuto(req.params.id).then((unblocked)=>{
    if(unblocked.block==="1"){
      res.redirect('/admin/blockedauto')
     }
     else{
       res.redirect('/admin/blockedauto')
     }
   }).catch((err)=>{
     res.redirect('/admin/blockedauto')
  })
})

//delete auto-driver
router.get('/delete-auto/:id',verifyLogin,(req,res,next)=>{
  adminHelper.deleteAuto(req.params.id).then((status)=>{
    req.session.deleted=true
    res.redirect('/admin/auto')
  })
})

//view auto profile
router.get('/view-auto/:id',verifyLogin,(req,res,next)=>{
  res.render('admin/auto-profile',{admin:true})
})

//view users
router.get('/users',verifyLogin, (req,res,next)=>{
  res.render('admin/users',{admin:true} );
});

//view blocked autos
router.get('/blockedauto',verifyLogin,(req,res,next)=>{
  adminHelper.getBlockedAuto().then((blockedAutos)=>{
    res.render('admin/blocked_auto', {admin:true,blockedAutos});
  })
 
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
  adminHelper.getCharge().then((charges)=>{
  res.render('admin/travel-charge',{admin:true,charges});
  })
});


//add travel charges
router.get('/addtravelrate',verifyLogin, (req,res,next)=>{
    res.render('admin/add-travel-charge',{admin:true});
});


//edit charge entered
router.get('/editcharge/:id',verifyLogin,(req,res,next)=>{
  adminHelper.editCharge(req.params.id).then((details)=>{
    res.render('admin/edit-travel-rate',{admin:true,details})
  }).catch((err)=>{
    res.send(err)
  })
})

//delete charge
router.get('/deletecharge/:id',verifyLogin,(req,res,next)=>{
  adminHelper.deleteCharge(req.params.id).then(()=>{
    res.redirect('/admin/travelcharge')
  })
})

//update charges
router.post('/updatetravelrate/:id',verifyLogin,(req,res,next)=>{
  adminHelper.updateCharge(req.params.id,req.body).then(()=>{
    res.redirect('/admin/travelcharge')
  })
})


//addtravelrate post request
router.post('/addtravelrate',verifyLogin,(req,res,next)=>{
  adminHelper.addTravelRate(req.body).then(()=>{
    res.redirect('/admin/travelcharge')
  })
})
module.exports = router;
