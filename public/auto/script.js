function accept_drive(autoId){
    $.ajax({
        url:'/auto/change-drive/'+autoId,
        method:'get',
        success:(response)=>{
           alert("accpted")
           location.href="/auto/booking"
        }
    })
}