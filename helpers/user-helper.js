var db = require('../config/connection')
var bcrypt = require('bcrypt')
var collections = require('../config/collections')
const objectId = require("mongodb").ObjectID


module.exports={
    //user signup
    userSignUp:(userDetails)=>{
        return new Promise(async(resolve,reject)=>{
            response={}
            let user = await db.get().collection(collections.USER_COLLECTION).findOne({username:userDetails.username})
            if(user){
                resolve({status:false})
            }else{
                userDetails.password = await bcrypt.hash(userDetails.password, 10)
                db.get().collection(collections.USER_COLLECTION).insertOne(userDetails).then((response)=>{
                    response.user=response.ops[0]
                    response.status=true
                    resolve(response)
                })
            } 
        })
    },

    //user login authentication
    loginAuthetication:(loginDetails)=>{
        return new Promise(async(resolve,reject)=>{
            let response={}
            let user=await db.get().collection(collections.USER_COLLECTION).findOne({username:loginDetails.username}) 
            if(user){
                bcrypt.compare(loginDetails.password,user.password).then((status)=>{
                    if(status){
                        response.user=user
                        response.status=true
                        resolve(response)
                    }else{
                        resolve({status:false})
                        
                    }
                })
            }else{
                resolve({status:false})
                
            }
        })
    },

    //get auto by locations when rendering home page 
    getAuto:(location)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.AUTO_COLLECTION).find({location:{$regex:location,$options:'i'}}).toArray().then((autos)=>{
                resolve(autos)
            })
            
        })
    },

    //get all auto for user not logged in
    getAllAutos:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.AUTO_COLLECTION).find().limit(4).toArray().then((autos)=>{
                resolve(autos)
            })
        })
    },

    //get autodetails for booking
    getAutoDetails:(autoId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.AUTO_COLLECTION).findOne({_id:objectId(autoId)}).then((auto)=>{
                resolve(auto)
            })
        })
    },

    //get from and to locations
    getChargeDetails:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.TRAVELPLACES_COLLECTION).find().toArray().then((result)=>{
                resolve(result)
            })
        })
    },

    //get charge of selected place
    getCharge:(location)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.TRAVELPLACES_COLLECTION).findOne({location:location.to}).then((charge)=>{
                resolve(charge)
            })
        })
    },

    //book auto
    bookAuto:(bookDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.BOOKING_COLLECTION).insertOne(bookDetails).then(()=>{
                resolve()
            })
        })
    },

    //get booking
    getBookings:(userId)=>{
        return new Promise((resolve,reject)=>{
            let response={}
            db.get().collection(collections.BOOKING_COLLECTION).findOne({userId:userId}).then((booking)=>{
                response.booking=booking
                db.get().collection(collections.AUTO_COLLECTION).findOne({_id:objectId(booking.autoId)}).then((auto)=>{
                    response.auto=auto
                    resolve(response)
                })
            })
        })
    }
}