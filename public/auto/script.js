function accept_drive(autoId){
    
    $.ajax({
        url:'/auto/change-drive/'+autoId,
        method:'get',
        success:(response)=>{
           alert("accepted")
           location.href="/auto/booking"
        }
    })
}

function reportUser(){
    $('#reportusermodal').modal('show')
}