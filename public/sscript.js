// self.addEventListener("install",e=>{
//     e.waitUntil(
//         caches.open("static").then(cache=>{
            
//             return cache.addAll([

//                 '/user/assets/',
//                 '/user/assets/style-starter.css',
                
                
//             ])
//         })
//     )
// })

// self.addEventListener("fetch",e=>{
//     e.respondWith(
        
//         caches.match(e.request).then((response)=>{
//             console.log("reached");
//             return response || fetch(e.request)
//         })
//     )
// })