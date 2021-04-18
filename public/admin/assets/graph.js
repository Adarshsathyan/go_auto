let adminChart=document.getElementById('adminChart').getContext('2d')


let total_auto =document.getElementById('total_auto').innerText
let total_user =document.getElementById('total_user').innerText
let accepted =document.getElementById('accepted').innerText
let revenue =document.getElementById('revenue').innerText


let chart= new Chart(adminChart,{
  type:'line',
  data:{
      labels:['Autos','Users','Accepted','Revenue'], 
      datasets:[{
          label:"Overall Status",
          data:[
            total_auto,
            total_user,
            accepted,
            revenue
          ],
          fill:false,
          borderColor:'rgb(75, 192, 192)',
          tension :0.1

      }]
  },
  options:{}
})