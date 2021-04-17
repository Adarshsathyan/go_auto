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

function rate(autoId){
    $('#rateFeedback').modal('show')
    $('#autoId').val(autoId)
    $('#send').on('click',function(){
        alert("sohoedn")
    })
} 

function report_auto(autoId){
    $('#report').modal('show');
    
}

function auto_report(autoId){
    $('#report').modal('show');
}