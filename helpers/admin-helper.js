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
            db.get().collection(collections.AUTO_COLLECTION).find({status:"1",block:"0"}).toArray().then((result)=>{
                resolve(result)
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

    //get blocked auto
    getBlockedAuto:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.AUTO_COLLECTION).find({status:"1",block:"1"}).toArray().then((result)=>{
                resolve(result)
            })       
         })
    },

    //delete auto-driver
    deleteAuto:(autoId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.AUTO_COLLECTION).removeOne({_id:objectId(autoId)}).then((response)=>{
                resolve({status:true})
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
    }
}