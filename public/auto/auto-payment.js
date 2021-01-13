//onclik in payment.hbs
function payment(autoId){
    $.ajax({
        url:'/auto/razorpay/'+autoId,
        method:'get',
        success:(response)=>{
            razropayPayment(response)
        }
    })
}
function razropayPayment(order){
    
    var options = {
    
        "key": "rzp_test_aXiLerJwygr3M5", // Enter the Key ID generated from the Dashboard
        "amount": order.response.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR",
        "name": "Go Auto",
        "description": "Payment for registration",
        "image": "./public/admin/assets/img/brand/blue.png",
        "order_id": order.response.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        "handler": function (response){
            
            // alert(response.razorpay_payment_id);
            // alert(response.razorpay_order_id);
            // alert(response.razorpay_signature)
            verifyPaid(response,order.response,order)
           
        },
        
        "prefill": {
            "name": order.autoDetails.name,
            "email": order.autoDetails.username,
            "contact": order.autoDetails.mobile
        },
        "notes": {
            "address": "Go_auto Online Travels"
        },
        "theme": {
            "color": "#7f2bfc"
        }
    };
    var rzp1 = new Razorpay(options);
    rzp1.open();
    function verifyPaid(payment,order,autoDetails){
        
        $.ajax({
            url:'/auto/verify-payment',
            data:{
                payment,
                order
            },
            method:'post',
            success:(response)=>{
                if(response.status){
                   location.href='/auto/home'

                }else{
                    alert("Transaction Failed")
                    location.href='/auto/payment/'+autoDetails.autoDetails._id
                }
            }
        })
   
    }
}