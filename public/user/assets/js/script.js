$(document).ready(function(){
    $('#to').on('change',function(){
        let to=$('#to').val()
        $.ajax({
            url:'/charge',
            data:{to:to},
            method:'post',
            success:(response)=>{
                $('#charge').val(response)
            }
        })
    })
})