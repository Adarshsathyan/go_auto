var express = require('express');
var router = express.Router();
const adminHelper=require('../helpers/admin-helper')
const accountSid = "AC33edf996551919434ee6a3d9664217ed";
const authToken = "7291649537bf825e7441f23534f5a176";
const twilio = require('twilio');

const client = new twilio(accountSid, authToken);



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
    res.render('admin/login',{adminErr:req.session.adminErr,title:"Login"} );
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
router.get('/home',verifyLogin, async(req,res,next)=>{ 
  let total_auto = await adminHelper.getTotalAuto()
  let total_user = await adminHelper.getTotalUser()
  let accepeted_auto = await adminHelper.getAcceptedAuto()
  let revenue = await adminHelper.getRevenue()
  adminHelper.getRequests().then((result)=>{
    req.session.autoRequest=result
    res.render('admin/index',{admin:true,notify:req.session.autoRequest,changedPass:req.session.adminPassChange,total_auto,
      total_user,accepeted_auto,revenue,title:"Home"} );
    req.session.adminPassChange=null
  }).catch(()=>{
    res.render('admin/index',{admin:true,changedPass:req.session.adminPassChange,total_auto,
      total_user,accepeted_auto,revenue,title:"Home"});
    req.session.adminPassChange=null
  })
  
});

//view autos
router.get('/auto',verifyLogin,(req,res,next)=>{
  adminHelper.getAllAuto().then((autos)=>{
    res.render('admin/auto-drivers',{admin:true,autos,deleted:req.session.deleted,autos,notify:req.session.autoRequest,title:"Autos"});
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

//block user
router.get('/block-user/:id',verifyLogin,(req,res)=>{
  adminHelper.blockUser(req.params.id).then((blocked)=>{
    if(blocked.status==="1"){
      res.redirect('/admin/users')
    }else{
      res.redirect('/admin/users')
    }
  }).catch(()=>{
    res.redirect('/admin/users')
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

//unblock users
router.get('/unblock-user/:id',verifyLogin,(req,res)=>{
  adminHelper.unblockUser(req.params.id).then((unblocked)=>{
    if(unblocked.status==="1"){
      res.redirect('/admin/blockeduser')
    }else{
      res.redirect('/admin/blockeduser')
    }
  }).catch(()=>{
    res.redirect('/admin/blockeduser')
  })
})

//delete auto-driver
router.get('/delete-auto/:id',verifyLogin,(req,res,next)=>{
  adminHelper.deleteAuto(req.params.id).then((status)=>{
    req.session.deleted=true
    res.redirect('/admin/auto')
  })
})


//delete user
router.get('/delete-user/:id',verifyLogin,(req,res)=>{
  adminHelper.deleteUser(req.params.id).then((status)=>{
    req.session.deleteUser=true
    res.redirect('/admin/users')
  })
})


//view auto profile
router.get('/view-auto/:id',verifyLogin,(req,res,next)=>{
  res.render('admin/auto-profile',{admin:true,notify:req.session.autoRequest,title:"Auto Profile"})
})


//view users
router.get('/users',verifyLogin, (req,res,next)=>{
  adminHelper.getUsers().then((users)=>{
    res.render('admin/users',{admin:true,notify:req.session.autoRequest,users,deletedUser:req.session.deletedUser,title:"Users"});
    req.session.deletedUser=false
  })
});


//view blocked autos
router.get('/blockedauto',verifyLogin,(req,res,next)=>{
  adminHelper.getBlockedAuto().then((blockedAutos)=>{
    res.render('admin/blocked_auto', {admin:true,blockedAutos,notify:req.session.autoRequest,title:"Blocked autos"});
  })
 
});

//view blocked user
router.get('/blockeduser',verifyLogin, (req,res,next)=> {
  adminHelper.getBlockedUsers().then((blockedUsers)=>{
    res.render('admin/blocked_user', {admin:true,notify:req.session.autoRequest,blockedUsers,title:"Blocked users"});
  })
  
});

//view auto statuses
router.get('/status',verifyLogin, (req,res,next)=>{
  adminHelper.getAuto().then((autos)=>{
    res.render('admin/auto-status',{admin:true,notify:req.session.autoRequest,autos,title:"Status"});
  })
 
});

//view feedbacks & reports
router.get('/feedback',verifyLogin, (req,res,next)=>{
  adminHelper.getFeedback().then((feedbacks)=>{
    adminHelper.getAutoReport().then((report_auto)=>{
      adminHelper.getUserReport().then((report_user)=>{
        res.render('admin/feedback',{admin:true,notify:req.session.autoRequest,feedbacks,report_auto,report_user,title:"Feedbacks"} );
      })
    
    })
    
  })
  
});


//view the trave charges
router.get('/travelcharge',verifyLogin, (req,res,next)=>{
  adminHelper.getCharge().then((charges)=>{
  res.render('admin/travel-charge',{admin:true,charges,notify:req.session.autoRequest,title:"Travel charge"});
  })
});


//add travel charges
router.get('/addtravelrate',verifyLogin, (req,res,next)=>{
    res.render('admin/add-travel-charge',{admin:true,notify:req.session.autoRequest,title:"Add travel charge"});
});


//edit charge entered
router.get('/editcharge/:id',verifyLogin,(req,res,next)=>{
  adminHelper.editCharge(req.params.id).then((details)=>{
    res.render('admin/edit-travel-rate',{admin:true,details,notify:req.session.autoRequest,title:"Edit travel charge"})
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

//auto requests
router.get('/auto-request',verifyLogin,(req,res)=>{
  adminHelper.getRequests().then((requests)=>{
    res.render('admin/auto-request',{admin:true,requests,accepted:req.session.accepted,notify:req.session.autoRequest,title:"Requests"})
    req.session.accepted=null
  })

})

//accept auto
router.get('/accept-auto/:id',verifyLogin,(req,res)=>{
  adminHelper.acceptAuto(req.params.id).then(async()=>{
    let auto_num = await adminHelper.getAutoNumber(req.params.id)

    client.messages
        .create({
          body: 'GoAuto have accepted your request. Please login with the credentials.',
          from: '+12245019575',
          to: "+91"+auto_num
        }).then((msg)=>{
          req.session.accepted=true
          req.session.autoRequest=null
          adminHelper.getRequests().then((result)=>{ 
            req.session.autoRequest=result
          })
          res.redirect('/admin/auto-request')
        })
  })
})

//reject auto
router.get('/reject-auto/:id',(req,res)=>{
  adminHelper.rejectAuto(req.params.id).then(async()=>{
    let auto_num = await adminHelper.getAutoNumber(req.params.id)
    client.messages
    .create({
      body: 'Your request for GoAuto have been rejected because of some verification error. Payment willbe Refunded within 24hrs',
      from: '+12245019575',
      to: "+91"+auto_num
    }).then((msg)=>{
      req.session.autoRequest=null
      res.redirect('/admin/auto-request')
    })
    
  })
})

//change password
router.get('/change-pass',verifyLogin,(req,res)=>{
  res.render('admin/change-password',{admin:true,admin:req.session.admin,passChangeErr:req.session.passChangeErr,title:"Change password"})
  req.session.passChangeErr=null
})

//change password post request
router.post('/change-pass',verifyLogin,(req,res)=>{
  adminHelper.changePass(req.body).then((response)=>{
    if(response.status){
      req.session.adminPassChange=true
      res.redirect('/admin/home')
    }else{
      req.session.passChangeErr=true
      res.redirect('/admin/change-pass')
    }
  })
})


//change phonenumber
router.get('/change-number',verifyLogin,(req,res)=>{
  res.render('admin/change-number',{admin:true,admin:req.session.admin,changed:req.session.numChanged,changeFail:req.session.numChangeFail,title:"Change number"})
  
  req.session.numChanged=null
  req.session.numChangeFail=null
})

//post request for changing mobile number
router.post('/change-number',verifyLogin,(req,res)=>{
  
  adminHelper.changeMobile(req.body).then((result)=>{
    if(result.status){
      req.session.numChanged=true
      res.redirect('/admin/change-number')
    }else{
      req.session.numChangeFail=true
      res.redirect('/admin/change-number')
    }
   
  })
})


//contacts page
router.get('/contact',verifyLogin,async(req,res)=>{
  let contacts = await adminHelper.getContacts()
  res.render('admin/contacts',{admin:true,notify:req.session.autoRequest,contacts,title:"Contacts"})
})
module.exports = router;
