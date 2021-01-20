

// function blockAuto(autoId){
//    $.ajax({
//        url:'/admin/block-auto/'+autoId,
//        method:'get',
//        success:(response)=>{
//           if(response.status){
//               $('#block').css('display','none')
//               $('#unblock').css('display','block')
//               location.href="/admin/auto"
//           }else{
//               alert("Something went wrong")
//           }
//        }
//    })
// }


$('#kilo').on('change',function(){
  let km=this.value
  $.ajax({
      url:'/auto/take-charge',
      data:{km:km},
      method:'post',
      success:(response)=>{
         $('#rate').val(response.charge)
      }
  })
});