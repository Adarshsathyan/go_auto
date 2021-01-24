var db = require('../config/connection')
var bcrypt = require('bcrypt')
var collections = require('../config/collections')
var Razorpay = require('razorpay');
const objectId = require("mongodb").ObjectID;
const { resolve } = require('path');

var instance = new Razorpay({
    key_id: 'rzp_test_aXiLerJwygr3M5',
    key_secret: 'HjXinQy80vkLrKQg5VwtjQ3V',
  });


module.exports={
    //signup for auto
    signUp:(autoDetails)=>{
        return new Promise(async(resolve,reject)=>{
            response={}
            let autoDriver = await db.get().collection(collections.AUTO_COLLECTION).findOne({username:autoDetails.username})
            if(autoDriver){
                resolve({status:false})
            }else{
                autoDetails.password = await bcrypt.hash(autoDetails.password, 10)
                db.get().collection(collections.AUTO_COLLECTION).insertOne(autoDetails).then((response)=>{
                    response.autoDriver=response.ops[0]
                    response.status=true
                    resolve(response)
                })
            } 
        })
    },

    //create payment order
    createPaymentOrder:(autoId)=>{
        return new Promise((resolve,reject)=>{
            var options = {
                amount: 100000,  // amount in the smallest currency unit
                currency: "INR",
                receipt: ""+autoId
              };
              instance.orders.create(options, function(err, order) {
                db.get().collection(collections.PAYMENT_COLLECTION).insertOne(order).then(()=>{
                    resolve(order)
                })
                
              });
        })
    },

    //take the dtails of order created auto
    getAuto:(autoId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.AUTO_COLLECTION).findOne({_id:objectId(autoId)}).then((autoDetails)=>{
                resolve(autoDetails)
            })
        })
    },

    //verify the payment
    verifyPayment:(paymentDetails)=>{
        return new Promise((resolve,reject)=>{
            const crypto =require('crypto')
            let hmac= crypto.createHmac('sha256','HjXinQy80vkLrKQg5VwtjQ3V') 
            hmac.update(paymentDetails['payment[razorpay_order_id]']+'|'+paymentDetails['payment[razorpay_payment_id]'])
            hmac=hmac.digest("hex")
            
            if(hmac===paymentDetails['payment[razorpay_signature]']){
                resolve()
            }else{
                reject()
            }
        
        })
    },

    //change status of registered user
    changePaidStatus:(autoId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.AUTO_COLLECTION).updateOne({_id:objectId(autoId)},{$set:{
                status:"1"
            }}).then(()=>{
                resolve()
            })
        })
    },

    //login authentication
    autoAuth:(loginDetails)=>{
        return new Promise(async(resolve,reject)=>{
            let response={}
            let auto=await db.get().collection(collections.AUTO_COLLECTION).findOne({username:loginDetails.username}) 
            if(auto){
                bcrypt.compare(loginDetails.password,auto.password).then((status)=>{
                    if(status){
                        response.auto=auto
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


    //get kilomteres added by admin
    getKm:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.TRAVELCHARGE_COLLECTION).find().toArray().then((result)=>{
                resolve(result)
            })
        })
    },


    //take charge
    takeCharge:(km)=>{
        return new Promise((resolve,reject)=>{
            
            db.get().collection(collections.TRAVELCHARGE_COLLECTION).findOne({kilometer:km.km}).then((charge)=>{
                resolve(charge)
            })
        })
    },

    //add tavel place
    addPlace:(placeDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.TRAVELPLACES_COLLECTION).insertOne(placeDetails).then(()=>{
                resolve()
            })
        })
    },

    //get added places for logged in auto driver
    getPlaces:(autoId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.TRAVELPLACES_COLLECTION).find({auto:autoId}).toArray().then((places)=>{
                resolve(places)
            })
        })
    },


    //get booking
    getbooking:(autoId)=>{
        return new Promise((resolve,reject)=>{
            booking={}
            db.get().collection(collections.BOOKING_COLLECTION).findOne({autoId:autoId}).then((result)=>{
                booking.booking=result
                if(result){
                    db.get().collection(collections.USER_COLLECTION).findOne({_id:objectId(result.userId)}).then((user)=>{
                        booking.user=user
                        resolve(booking)
                    })
                }else{
                    reject()
                }
               
                
                
            })
        })
    },

    //change drive ststus while accept booking
    changeDriveStatus:(autoId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.AUTO_COLLECTION).updateOne({_id:objectId(autoId)},{$set:{
                drive:"ondrive"
            }}).then(()=>{
                db.get().collection(collections.AUTO_COLLECTION).findOne({_id:objectId(autoId)}).then((auto)=>{
                    resolve(auto)
                })
            })
        })
        
    },

    //complete drive
    completeDrive:(autoId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.BOOKING_COLLECTION).updateOne({autoId:autoId},{$set:{
                status:"1"
            }}).then(()=>{
                db.get().collection(collections.AUTO_COLLECTION).updateOne({_id:objectId(autoId)},{$set:{
                    drive:"Available"
                }}).then(()=>{
                    db.get().collection(collections.BOOKING_COLLECTION).findOne({autoId:autoId}).then((booking)=>{
                        let drive={
                            bookId:booking._id,
                            from:booking.from,
                            status:booking.status,
                            autoId:booking.autoId,
                            userId:booking.userId,
                            mobile:booking.mobile,
                            landmark:booking.landmark,
                            to:booking.to,
                            charge:booking.charge

                        }
                        db.get().collection(collections.DRIVE_COLLECTION).insertOne(drive).then(()=>{
                            db.get().collection(collections.BOOKING_COLLECTION).removeOne({_id:objectId(drive.bookId)}).then(()=>{
                                db.get().collection(collections.AUTO_COLLECTION).findOne({_id:objectId(autoId)}).then((auto)=>{
                                    resolve(auto)
                                })
                               
                            })
                            
                        })
                    })
                })
            })
        })
    }
}