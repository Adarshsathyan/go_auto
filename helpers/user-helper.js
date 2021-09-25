var db = require('../config/connection')
var bcrypt = require('bcrypt')
var collections = require('../config/collections')
const objectId = require("mongodb").ObjectID
require('dotenv').config()

//for sending otp

const twilioOtp = require('twilio')(process.env.ACCOUNTSID, process.env.AUTHTOKEN)

module.exports = {
    //user signup
    userSignUp: (userDetails) => {
        return new Promise(async (resolve, reject) => {
            response = {}
            let user = await db.get().collection(collections.USER_COLLECTION).findOne({ username: userDetails.username })
            if (user) {
                resolve({ status: false })
            } else {
                let mobile = await db.get().collection(collections.USER_COLLECTION).findOne({mobile:userDetails.mobile})
                if(mobile){
                    resolve({status:false})
                }else{
                    userDetails.password = await bcrypt.hash(userDetails.password, 10)
                    db.get().collection(collections.USER_COLLECTION).insertOne(userDetails).then((response) => {
                        response.user = response.ops[0]
                        response.status = true
                        resolve(response)
                    })
                }
               
            }
        })
    },

    //user login authentication
    loginAuthetication: (loginDetails) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            let user = await db.get().collection(collections.USER_COLLECTION).findOne({ username: loginDetails.username })
            if (user) {
                bcrypt.compare(loginDetails.password, user.password).then((status) => {
                    if (status) {
                        response.user = user
                        response.status = true
                        resolve(response)
                    } else {
                        resolve({ status: false })

                    }
                })
            } else {
                resolve({ status: false })

            }
        })
    },

    //get auto by locations when rendering home page 
    getAuto: (location) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.AUTO_COLLECTION).find({drive:"Available"}).toArray().then((autos) => {
                resolve(autos)
            })

        })
    },

    //get all auto for user not logged in
    getAllAutos: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.AUTO_COLLECTION).find({status:"2"}).limit(4).toArray().then((autos) => {
                resolve(autos)
            })
        })
    },

    //get autodetails for booking
    getAutoDetails: (autoId) => {
        
        return new Promise((resolve, reject) => {
            db.get().collection(collections.AUTO_COLLECTION).findOne({ _id: objectId(autoId) }).then((auto) => {
                resolve(auto)
            })
        })
    },

    //get from and to locations
    getChargeDetails: (autoId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.TRAVELPLACES_COLLECTION).find({auto:autoId}).toArray().then((result) => {
                resolve(result)
            })
        })
    },

    //get charge of selected place
    getCharge: (location) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.TRAVELPLACES_COLLECTION).findOne({ location: location.to }).then((charge) => {
                resolve(charge)
            })
        })
    },

    //book auto
    bookAuto: (bookDetails) => {
        return new Promise((resolve, reject) => {
            var today = new Date();
            var dd = String(today.getDate()).padStart(2, '0');
            var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = today.getFullYear();

            today = dd + '/' + mm + '/' + yyyy;
            bookDetails.date = today
            bookDetails.autoId = objectId(bookDetails.autoId)
            db.get().collection(collections.BOOKING_COLLECTION).insertOne(bookDetails).then((response) => {
                    resolve(response.ops[0].userId)
            })
        })
    },

    //get booking
    getBookings: (userId) => {
        return new Promise((resolve, reject) => {
            let response = {}
            db.get().collection(collections.BOOKING_COLLECTION).findOne({ userId: userId }).then((booking) => {
                response.booking = booking
                if (booking) {
                    db.get().collection(collections.AUTO_COLLECTION).findOne({ _id: objectId(booking.autoId) }).then((auto) => {
                        response.auto = auto
                        resolve(response)
                    })
                } else {
                    reject()
                }

            })
        })
    },

    //get user details
    getUserDetails: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.USER_COLLECTION).findOne({ _id: objectId(userId) }).then((result) => {
                resolve(result)
            })
        })
    },

    //rides
    rideDetails: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.DRIVE_COLLECTION).find({ userId: userId }).toArray().then((rides) => {
                resolve(rides)
            })
        })
    },

    //send feedback
    sendFeedback: (feedback) => {
        return new Promise((resolve, reject) => {
            feedback.autoId=objectId(feedback.autoId)
            db.get().collection(collections.FEEDBACK_COLLECTION).insertOne(feedback).then(() => {
                resolve()
            })
        })
    },

    //report auto
    sendReport: (details) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.REPORT_AUTO).insertOne(details).then(() => {
                db.get().collection(collections.BOOKING_COLLECTION).findOne({ userId: details.userId }).then((result) => {
                    db.get().collection(collections.DRIVE_COLLECTION).insertOne(result).then(() => {
                        db.get().collection(collections.BOOKING_COLLECTION).removeOne({ userId: details.userId }).then(() => {
                            resolve()
                        })
                    })
                })

            })
        })
    },

    //search auto
    searchAuto: (data) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.AUTO_COLLECTION).find({ location: { $regex: data.from, $options: 'i' } }).toArray().then((autos) => {
                if (autos) {
                    resolve(autos)
                } else {
                    reject()
                }
            })
        })
    },

    //get auto driver details for profile view from user side
    getAutoDriver: (autoId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.AUTO_COLLECTION).findOne({ _id: objectId(autoId) }).then((response) => {
                if (response._id) {
                    resolve(response)
                } else {
                    resolve()
                }
            })
        })
    },

    //report auto from auto profile by user
    reportAuto: (details) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.REPORT_AUTO).insertOne(details).then(() => {
                resolve()
            })
        })
    },

    //update profile
    updateProfile: (details) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.USER_COLLECTION).updateOne({ username: details.username }, {
                $set: {
                    name: details.name,
                    username: details.username,
                    mobile: details.mobile,
                    location: details.location
                }
            }).then(() => {
                db.get().collection(collections.USER_COLLECTION).findOne({ username: details.username }).then((result) => {
                    resolve(result)
                })

            })
        })
    },
    

    //contact post requset
    contactAdmin:(details)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.CONTACT_COLLECTION).insertOne(details).then(()=>{
                resolve()
            })
        })
    },

    //send otp for forgoted password
    sentOtp:(mobile)=>{
        return new Promise(async(resolve,reject)=>{
            let response={}
            let user = await db.get().collection(collections.USER_COLLECTION).findOne({mobile:mobile.mobile})
            
            if(user){
                twilioOtp
                    .verify
                    .services(process.env.SERVICEID)
                    .verifications
                    .create({
                        to:"+91" + mobile.mobile,
                        channel:"sms"
                    }).then((data)=>{
                        response.data=data
                        response.user=user
                        resolve(response)
                    })
            }else{
                let data = {status:false}
                response.data=data
                resolve(response)
            }
        })
    }, 

    //verify the otp for forgot password
    verifyOtp:(mobile,otpDetails)=>{
        return new Promise((resolve,reject)=>{
          
            twilioOtp
                .verify
                .services(process.env.SERVICEID)
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
    changeForgotPassword:(details)=>{
        return new Promise(async(resolve,reject)=>{
            
            let user = await db.get().collection(collections.USER_COLLECTION).findOne({_id:objectId(details.userId)})
            if(user){
                details.password = await bcrypt.hash(details.password,10)
                db.get().collection(collections.USER_COLLECTION).updateOne({_id:objectId(details.userId)},{$set:{
                    password:details.password
                }}).then((response)=>{
                    resolve({status:true})
                })
            }else{
                resolve({status:false})
            }
        })
    },

    //change password manually by user
    changePassword:(details)=>{
        return new Promise(async(resolve,reject)=>{
            let user = await db.get().collection(collections.USER_COLLECTION).findOne({_id:objectId(details.userId)})
            if(user){
                bcrypt.compare(details.password1,user.password).then(async(status)=>{
                    if(status){
                        details.password = await bcrypt.hash(details.password,10)
                        db.get().collection(collections.USER_COLLECTION).updateOne({_id:objectId(details.userId)},{$set:{
                            password:details.password
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

    //get the booking or checking if the user have any another booking
    getUserBooking:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let booking = await db.get().collection(collections.BOOKING_COLLECTION).findOne({userId:userId})
            if(booking){
                resolve(booking)
            }else{
                resolve({status:true})
            }
        })
    }
}
