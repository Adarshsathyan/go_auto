let myChart=document.getElementById('overallChart').getContext('2d')
let bookings =document.getElementById('total_booking').innerText
let completed =document.getElementById('total_travel').innerText
let places =document.getElementById('total_place').innerText
let rating =document.getElementById('rating').innerText
let chart= new Chart(myChart,{
  type:'line',
  data:{
      labels:['Bookings','Completed','Places','Ratings'], 
      datasets:[{
          label:"Overall Status",
          data:[
            bookings,
            completed,
            places,
            rating
          ],
          fill:false,
          borderColor:'rgb(75, 192, 192)',
          tension :0.1

      }]
  },
  options:{}
})