var db = require('../config/connection')
var bcrypt = require('bcrypt')
var collections = require('../config/collections')
var Razorpay = require('razorpay');
const objectId = require("mongodb").ObjectID;
var otpAuth = require('../config/otpauth');
const twilio = require('twilio')(otpAuth.accountSId, otpAuth.authToken)


var instance = new Razorpay({
    key_id: 'rzp_test_aXiLerJwygr3M5',
    key_secret: 'HjXinQy80vkLrKQg5VwtjQ3V',
  });


module.exports={
    //signup for auto
    signUp:(autoDetails)=>{
        return new Promise(async(resolve,reject)=>{
            let response={}
            let autoDriver = await db.get().collection(collections.AUTO_COLLECTION).findOne({username:autoDetails.username})
            let autoPhn = await db.get().collection(collections.AUTO_COLLECTION).findOne({mobile:autoDetails.mobile})
            if(autoDriver){
                resolve({status:false})
            }else if(autoPhn){
                resolve({status:false})  
            }
            else{
                autoDetails.password = await bcrypt.hash(autoDetails.password, 10)
                var today = new Date();
                var dd = String(today.getDate()).padStart(2, '0');
                var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
                var yyyy = today.getFullYear();

                today = dd + '/' + mm + '/' + yyyy;
                autoDetails.joined=today
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
                if(auto.status==="2"){
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
           let booking={}
            db.get().collection(collections.BOOKING_COLLECTION).findOne({autoId:objectId(autoId)}).then((result)=>{
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
            let response={}
            db.get().collection(collections.AUTO_COLLECTION).updateOne({_id:objectId(autoId)},{$set:{
                drive:"Ondrive"
            }}).then(()=>{
                db.get().collection(collections.AUTO_COLLECTION).findOne({_id:objectId(autoId)}).then((auto)=>{
                    db.get().collection(collections.BOOKING_COLLECTION).findOne({autoId:objectId(auto._id)}).then((booking)=>{
                        response.auto=auto
                        response.booking=booking
                        resolve(response)
                    })
                    
                })
            })
        })
        
    },

    //complete drive
    completeDrive:(autoId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.BOOKING_COLLECTION).updateOne({autoId:objectId(autoId)},{$set:{
                status:"1"
            }}).then(()=>{
                    db.get().collection(collections.BOOKING_COLLECTION).findOne({autoId:objectId(autoId)}).then((booking)=>{
                        db.get().collection(collections.AUTO_COLLECTION).findOne({_id:objectId(autoId)}).then(async(autoDetails)=>{
                            let user = await db.get().collection(collections.USER_COLLECTION).findOne({_id:objectId(booking.userId)})
                        
                        let drive={
                            customer:user.name,
                            email:user.username,
                            bookId:booking._id,
                            from:booking.from,
                            status:booking.status,
                            autoId:booking.autoId,
                            userId:booking.userId,
                            mobile:booking.mobile,
                            landmark:booking.landmark,
                            to:booking.to,
                            charge:booking.charge,
                            regno:autoDetails.regno,
                            date:booking.date

                        }
                        db.get().collection(collections.DRIVE_COLLECTION).insertOne(drive).then(()=>{
                            db.get().collection(collections.BOOKING_COLLECTION).removeOne({_id:objectId(drive.bookId)}).then(()=>{
                                db.get().collection(collections.AUTO_COLLECTION).updateOne({_id:objectId(autoId)},{$set:{
                                    drive:"Available",
                                    revenue:booking.charge
                                }}).then(()=>{
                                db.get().collection(collections.AUTO_COLLECTION).findOne({_id:objectId(autoId)}).then((auto)=>{
                                    
                                    resolve(auto)
                                })
                               
                            })
                            
                        })
                    })
                    })
                })
            })
        })
    },
 
    //report user
    reportUser:(details)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.REPORT_USER).insertOne(details).then(()=>{
                db.get().collection(collections.BOOKING_COLLECTION).findOne({autoId:details.autoId}).then((result)=>{
                    db.get().collection(collections.DRIVE_COLLECTION).insertOne(result).then(()=>{
                        db.get().collection(collections.BOOKING_COLLECTION).removeOne({autoId:details.autoId}).then(()=>{
                            resolve()
                        })
                    })
                })
            })
        })
    },

    //change drive status manually by auto
    changeStatus:(autoId,value)=>{
        return new Promise(async(resolve,reject)=>{
            let auto =await db.get().collection(collections.AUTO_COLLECTION).findOne({_id:objectId(autoId)})
            if(auto.drive==="Available"){
                db.get().collection(collections.AUTO_COLLECTION).updateOne({_id:objectId(autoId)},{$set:{
                    drive:"Offline"
                }}).then(()=>{
                    resolve({status:"Offline"})
                })
            }else if (auto.drive==="Offline"){
                db.get().collection(collections.AUTO_COLLECTION).updateOne({_id:objectId(autoId)},{$set:{
                    drive:"Available"
                }}).then(()=>{
                    resolve({status:"Available"})
                }) 
            }else {
                db.get().collection(collections.AUTO_COLLECTION).updateOne({_id:objectId(autoId)},{$set:{
                    drive:"Ondrive"
                }}).then(()=>{
                    resolve({status:"Available"})
                }) 
            }
            
        })
    },

    //take all the details of places for editing
    getPlaceDetails:(placeId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.TRAVELPLACES_COLLECTION).findOne({_id:objectId(placeId)}).then((result)=>{
                resolve(result)
            })
        })
    },

    updatePlace:(placeId,details)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.TRAVELPLACES_COLLECTION).updateOne({_id:objectId(placeId)},{$set:{
                location:details.location,
                auto:details.auto,
                from:details.from,
                kilometer:details.kilometer,
                charge:details.charge
            }}).then(()=>{
                resolve()
            })
        })
    },


    //get users travelled in auto
    getUsersTravelled:(autoId)=>{
        return new Promise(async(resolve,reject)=>{
            let drive = await db.get().collection(collections.DRIVE_COLLECTION).find({autoId:objectId(autoId),status:"1"}).toArray()
            if(drive){
                resolve(drive)
            }else{
                reject()
            }
        })
    },

    //update profile of auto
    updateProfile:(autoId,autoDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.AUTO_COLLECTION).updateOne({_id:objectId(autoId)},{$set:{
                name:autoDetails.name,
                username:autoDetails.username,
                location:autoDetails.location,
                mobile:autoDetails.mobile
            }}).then(()=>{
                db.get().collection(collections.AUTO_COLLECTION).findOne({_id:objectId(autoId)}).then((auto)=>{
                    resolve(auto)
                })
                
            })
        })
    },

    //get all details for profile
    getProfileDetails:(autoId)=>{
        return new Promise((resolve,reject)=>{
            let response={}
            db.get().collection(collections.BOOKING_COLLECTION).findOne({autoId:objectId(autoId)}).then((booking)=>{
                if(booking){
                    response.booking=booking
                    db.get().collection(collections.USER_COLLECTION).findOne({_id:objectId(booking.userId)}).then((result)=>{
                        response.booking.name=result.name
                    })
                }
                db.get().collection(collections.DRIVE_COLLECTION).find({autoId:objectId(autoId),status:"1"}).limit(5).toArray().then((drives)=>{
                    response.drives=drives
                    resolve(response)
                })
            })
        })
    },
     //change password
     changePass:(details)=>{
        return new Promise(async(resolve,reject)=>{

            details.password = await bcrypt.hash(details.password,10)
            let password = details.password
            let auto = await db.get().collection(collections.AUTO_COLLECTION).findOne({_id:objectId(details.autoId)})
            if(auto){
                bcrypt.compare(details.password1,auto.password).then((status)=>{
                    if(status){
                        db.get().collection(collections.AUTO_COLLECTION).updateOne({_id:objectId(details.autoId)},{$set:{
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

    //send otp for forgot password
    sendOtp:(phoneDetails)=>{
        return new Promise(async(resolve,reject)=>{
            let response={}
            let auto = await db.get().collection(collections.AUTO_COLLECTION).findOne({mobile:phoneDetails.mobile})
            if(auto){
                twilio
                    .verify
                    .services(otpAuth.serviceID)
                    .verifications
                    .create({
                        to:"+91" + phoneDetails.mobile,
                        channel:"sms"
                    }).then((data)=>{
                        response.data=data
                        response.auto=auto
                        resolve(response)
                    })
            }else{
                let data = {status:false}
                response.data=data
                resolve(response)
            }
        })
    },


    //verify otp  for forgot password
    verifyOtp:(mobile,otpDetails)=>{
        return new Promise((resolve,reject)=>{
            console.log("MObile",mobile,"Otp",otpDetails);
            twilio
                .verify
                .services(otpAuth.serviceID)
                .verificationChecks
                .create({
                    to:mobile,
                    code:otpDetails.otp
                }).then((data)=>{
                    resolve(data)
                })
        })
    },


    //change password by forgot password
    changeForgotPass:(details)=>{
        return new Promise(async(resolve,reject)=>{
            let auto = await db.get().collection(collections.AUTO_COLLECTION).findOne({_id:objectId(details.userId)})
            if(auto){
                details.password = await bcrypt.hash(details.password,10)
                db.get().collection(collections.AUTO_COLLECTION).updateOne({_id:objectId(details.userId)},{$set:{
                    password:details.password
                }}).then((response)=>{
                    resolve({status:true})
                })
            }else{
                resolve({status:false})
            }
        })
    },


    //get feedbacks
    getFeedbacks:(autoId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.FEEDBACK_COLLECTION).find({autoId:autoId}).toArray().then((result)=>{
                resolve(result)
            })
        })
    },
 
    //get rating number
    getRating:(autoId)=>{
        return new Promise((resolve,reject)=>{
            autoId = 
            db.get().collection(collections.FEEDBACK_COLLECTION).find({autoId:objectId(autoId)}).toArray().then((feedbacks)=>{
                
                let rate =[]
                feedbacks.forEach(element => {
                   rate.push(parseInt(element.rate))
                });
                
                let total = 0
                for(i in rate){
                    total = total+rate[i]
                }
                let rating = total/10
                resolve(rating)
            })
        })
    },

    //get all booking number for displaying in home
    getAllBookings:(autoId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.DRIVE_COLLECTION).find({autoId:objectId(autoId)}).toArray().then((result)=>{
                if(result){
                    let total = result.length
                    resolve(total)
                }else{
                    resolve(0)
                }
            })
        })
    },

    //get all complted trave auto number for displaying in the total travel card in home
    getCompletedTravels:(autoId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.DRIVE_COLLECTION).find({autoId:objectId(autoId),status:"1"}).toArray().then((result)=>{
                if(result){
                    let total = result.length
                    resolve(total)
                }else{
                    resolve(0)
                }
            })
        })
    },
    getTotalPlaces:(autoId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.TRAVELPLACES_COLLECTION).find({auto:autoId}).toArray().then((result)=>{
                if(result){
                    let total = result.length
                    resolve(total)
                }else{
                    resolve(0)
                }
            })
        })
    },

    //to get the admin number for autosignup to give a message to admin
    getAdminNum:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.ADMIN_COLLECTION).findOne().then((result)=>{
                resolve(result.mobile)
            })
        })
    }
        
    
}