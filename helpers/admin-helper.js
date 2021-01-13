var db = require('../config/connection')
var bcrypt = require('bcrypt')
var collections = require('../config/collections')

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
    }
}