var db = require('../config/connection')
var bcrypt = require('bcrypt')
var collections = require('../config/collections')
const objectId = require("mongodb").ObjectID

module.exports = {
    
    // doSign:(details) => {
    //     return new Promise(async (resolve, reject) => {
    //         details.password = await bcrypt.hash(details.password, 10)
    //         db.get().collection(collections.ADMIN_COLLECTION).insertOne(details).then((response) => {
    //             resolve(response.ops[0])
    //         })
    //     })
    // }

    //admin authentication
    adminLogin:(adminData)=>{
        return new Promise(async(resolve,reject)=>{
            let response={}
            let admin=await db.get().collection(collections.ADMIN_COLLECTION).findOne({username:adminData.username}) 
            if(admin){
                bcrypt.compare(adminData.password,admin.password).then((status)=>{
                    if(status){
                        response.admin=admin
                        response.status=true
                        resolve(response)
                    }else{
                        resolve({status:false})
                        console.log("login failed");
                    }
                })
            }else{
                resolve({status:false})
                console.log("failed");
            }
        })
    },

    //get all registered auto drivers
    getAllAuto:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.AUTO_COLLECTION).find({status:"2",block:"0"}).toArray().then((result)=>{
                resolve(result)
            })       
         })
    },

    //block user
    blockUser:(userId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.USER_COLLECTION).updateOne({_id:objectId(userId)},{$set:{
                status:"1"
            }}).then(async()=>{
              let blocked = await db.get().collection(collections.USER_COLLECTION).findOne({_id:objectId(userId),status:"1"})
              if(blocked){
                  resolve(blocked)
              }else{
                  reject()
              }
            })
        })
    },

    //block auto drivers
    blockAuto:(autoId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.AUTO_COLLECTION).updateOne({_id:objectId(autoId)},{$set:{
                block:"1"
            }}).then(async()=>{
              let blocked = await db.get().collection(collections.AUTO_COLLECTION).findOne({_id:objectId(autoId),block:"1"})
              if(blocked){
                  resolve(blocked)
              }else{
                  reject()
              }
            })
        })
    },

    //unblock auto
    unblockAuto:(autoId)=>{
        return new Promise((resolve,reject)=>{
           
            db.get().collection(collections.AUTO_COLLECTION).updateOne({_id:objectId(autoId)},{$set:{
                block:"0"
            }}).then(async()=>{
              let unblocked = await db.get().collection(collections.AUTO_COLLECTION).findOne({_id:objectId(autoId),block:"0"})
              if(unblocked){
                  resolve(unblocked)
              }else{
                  reject()
              }
            })
        })
    },

    //unblock users
    unblockUser:(userId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.USER_COLLECTION).updateOne({_id:objectId(userId)},{$set:{
                status:"0"
            }}).then(async()=>{
              let unblocked = await db.get().collection(collections.USER_COLLECTION).findOne({_id:objectId(userId),status:"0"})
              if(unblocked){
                  resolve(unblocked)
              }else{
                  reject()
              }
            })
        })
    },

    //get blocked users
    getBlockedUsers:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.USER_COLLECTION).find({status:"1"}).toArray().then((result)=>{
                resolve(result)
            })       
         })
    },

    //get blocked auto
    getBlockedAuto:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.AUTO_COLLECTION).find({status:"2",block:"1"}).toArray().then((result)=>{
                resolve(result)
            })       
         })
    },

    //delete auto-driver
    deleteAuto:(autoId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.AUTO_COLLECTION).removeOne({_id:objectId(autoId)}).then((response)=>{
                db.get().collection(collections.TRAVELPLACES_COLLECTION).remove({auto:autoId}).then(()=>{
                    db.get().collection(collections.DRIVE_COLLECTION).remove({autoId:objectId(autoId)}).then(()=>{
                        resolve({status:true})
                    })  
                    
                })
                
            })
        })
    },

    //add travel rate
    addTravelRate:(details)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.TRAVELCHARGE_COLLECTION).insertOne(details).then(()=>{
                resolve()
            })
        })
    },

    //get travel charges
    getCharge:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.TRAVELCHARGE_COLLECTION).find().toArray().then((charges)=>{
                resolve(charges)
            })
        })
    },

    //get the details of travel charge by id
    editCharge:(chargeId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.TRAVELCHARGE_COLLECTION).findOne({_id:objectId(chargeId)}).then((result)=>{
                if(result){
                    resolve(result)
                }else{
                    reject()
                }
            })
        })
    },

    //update charges
    updateCharge:(chargeId,details)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.TRAVELCHARGE_COLLECTION).updateOne({_id:objectId(chargeId)},{$set:{
                kilometer:details.kilometer,
                charge:details.charge
            }}).then(()=>{
                resolve()
            })
        })
    },
    
    //delete charge
    deleteCharge:(chargeId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.TRAVELCHARGE_COLLECTION).removeOne({_id:objectId(chargeId)}).then(()=>{
                resolve()
            })
        })
    },
    
    //delete user
    deleteUser:(userId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.USER_COLLECTION).removeOne({_id:objectId(userId)}).then(()=>{
                resolve()
            })
        })
    },
 
    //auto drivers request
    getRequests:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.AUTO_COLLECTION).find({status:"1"}).toArray().then((requests)=>{
                if(requests){
                    resolve(requests)
                }else{
                    reject()
                }
                
            })
        })
    },

    //auto accept
    acceptAuto:(autoId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.AUTO_COLLECTION).updateOne({_id:objectId(autoId)},{$set:{
                status:"2"
            
            }}).then(()=>{
                resolve()
            })
        })
    },

    //reject auto
    rejectAuto:(autoId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.AUTO_COLLECTION).updateOne({_id:objectId(autoId)},{$set:{
                status:"0"
            }}).then(()=>{
                resolve()
            })
        })
    },

    //get al registered users
    getUsers:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.USER_COLLECTION).find({status:"0"}).toArray().then((users)=>{
                resolve(users)
            })
        })
    },

    //get all autos for status viewing
    getAuto:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.AUTO_COLLECTION).find().toArray().then((autos)=>{
                resolve(autos)
            })
        })
    },
    getFeedback:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.FEEDBACK_COLLECTION).find().toArray().then((feedbacks)=>{
                resolve(feedbacks)
            })
        })
    },


    //get reports about auto
    getAutoReport:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.REPORT_AUTO).find().toArray().then((result)=>{
                resolve(result)
            })
        })
    },

    //get reports about user by auto 
    getUserReport:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.REPORT_USER).find().toArray().then((result)=>{
                resolve(result)
            })
        })  
    },

    //change password
    changePass:(details)=>{
        return new Promise(async(resolve,reject)=>{

            details.password = await bcrypt.hash(details.password,10)
            let password = details.password
            let admin = await db.get().collection(collections.ADMIN_COLLECTION).findOne({_id:objectId(details.adminId)})
            if(admin){
                bcrypt.compare(details.password1,admin.password).then((status)=>{
                    if(status){
                        db.get().collection(collections.ADMIN_COLLECTION).updateOne({_id:objectId(details.adminId)},{$set:{
                            password:password
                        }}).then(()=>{
                            resolve({status:true})
                        })
                    }else{
                        resolve({status:false})
                    }
                })
            }else{
                resolve({status:false})
            }
          
                
          
        })
    },

    //get total auto
    getTotalAuto:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.AUTO_COLLECTION).find().toArray().then((result)=>{
                if(result){
                    let total_auto = result.length
                    resolve(total_auto)
                }else{
                    resolve(0)
                }
               
            })
        })
    },

    //get all user
    getTotalUser:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.USER_COLLECTION).find().toArray().then((result)=>{
                if(result){
                    let total_user = result.length
                    resolve(total_user)
                }else{
                    resolve(0)
                }
            })
        })
    },

    //get accpeted auto
    getAcceptedAuto:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.AUTO_COLLECTION).find({status:"2"}).toArray().then((result)=>{
                if(result){
                    let total_auto = result.length
                    resolve(total_auto)
                }else{
                    resolve(0)
                }
               
            })
        })
    },

    //get revenue
    getRevenue:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.AUTO_COLLECTION).find({status:"2"}).toArray().then((result)=>{
                if(result){
                    let number = parseInt(result.length)
                    let revenue = number*1000
                    resolve(revenue)
                }else{
                    resolve(0)
                }
            })
        })
    },
    //get the auto number for sending sms
    getAutoNumber:(autoId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.AUTO_COLLECTION).findOne({_id:objectId(autoId)}).then((result)=>{
                resolve(result.mobile)
            })
        })
    },

    //change mobile number
    changeMobile:(details)=>{
        return new Promise(async(resolve,reject)=>{
            let admin = await db.get().collection(collections.ADMIN_COLLECTION).findOne({_id:objectId(details.adminId)})
            
            if(admin){
                // details.password = await bcrypt.hash(details.password,10)
                
                bcrypt.compare(details.password,admin.password).then((status)=>{
                    
                    if(status){
                        db.get().collection(collections.ADMIN_COLLECTION).updateOne({_id:objectId(details.adminId)},{$set:{
                            mobile:details.mobile
                        }}).then(()=>{
                            resolve({status:true})
                        })
                    }else{
                        resolve({status:false})
                    }
                })
            }else{
                resolve({status:false})
            }
        })
    },

    //get contacts
    getContacts:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.CONTACT_COLLECTION).find().toArray().then((result)=>{
                resolve(result)
            })
        })
    }

}