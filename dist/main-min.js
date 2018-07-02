let restaurants,neighborhoods,cuisines;var map,markers=[];document.addEventListener("DOMContentLoaded",e=>{fetchNeighborhoods(),fetchCuisines(),navigator.serviceWorker&&navigator.serviceWorker.register("/sw.js").then(()=>console.log("Service Worker works !!")),createIndexedDB()}),createIndexedDB=(()=>{let e,t;const n=window.indexedDB||window.mozIndexedDB||window.webkitIndexedDB||window.msIndexedDB;n||console.error("Indexed databases not supported"),DBHelper.fetchRestaurants((e,n)=>{t=n});const r=n.open("restaurant-db",1);r.onerror=(e=>{console.error("Failed to open indexed database !"),console.error("Error message",e.target)}),r.onsuccess=(t=>{e=t.target.result}),r.onupgradeneeded=(n=>{e=n.target.result;Object.keys(t[0]);const r=e.createObjectStore("restaurants",{keyPath:"id"});r.createIndex("name","name",{unique:!1}),r.createIndex("address","address",{unique:!1}),r.transaction.oncomplete=(n=>{const r=e.transaction(["restaurants"],"readwrite").objectStore("restaurants");addToIndexedDB(r,t)})})}),addToIndexedDB=((e,t)=>{t.forEach(t=>{e.add(t)})}),fetchNeighborhoods=(()=>{DBHelper.fetchNeighborhoods((e,t)=>{e?console.error(e):(self.neighborhoods=t,fillNeighborhoodsHTML())})}),fillNeighborhoodsHTML=((e=self.neighborhoods)=>{const t=document.getElementById("neighborhoods-select");e.forEach(e=>{const n=document.createElement("option");n.innerHTML=e,n.value=e,t.append(n)})}),fetchCuisines=(()=>{DBHelper.fetchCuisines((e,t)=>{e?console.error(e):(self.cuisines=t,fillCuisinesHTML())})}),fillCuisinesHTML=((e=self.cuisines)=>{const t=document.getElementById("cuisines-select");e.forEach(e=>{const n=document.createElement("option");n.innerHTML=e,n.value=e,t.append(n)})}),window.initMap=(()=>{self.map=new google.maps.Map(document.getElementById("map"),{zoom:12,center:{lat:40.722216,lng:-73.987501},scrollwheel:!1}),updateRestaurants()}),updateRestaurants=(()=>{const e=document.getElementById("cuisines-select"),t=document.getElementById("neighborhoods-select"),n=e.selectedIndex,r=t.selectedIndex,a=e[n].value,s=t[r].value;DBHelper.fetchRestaurantByCuisineAndNeighborhood(a,s,(e,t)=>{e?console.error(e):(resetRestaurants(t),fillRestaurantsHTML())})}),resetRestaurants=(e=>{self.restaurants=[],document.getElementById("restaurants-list").innerHTML="",self.markers.forEach(e=>e.setMap(null)),self.markers=[],self.restaurants=e}),fillRestaurantsHTML=((e=self.restaurants)=>{const t=document.getElementById("restaurants-list");e.forEach(e=>{t.append(createRestaurantHTML(e))}),addMarkersToMap()}),createRestaurantHTML=(e=>{const t=document.createElement("li");t.tabIndex="0";const n=document.createElement("img");n.className="restaurant-img lazy",n.setAttribute("alt",`${e.name} Restaurant`),n.setAttribute("data-echo",DBHelper.imageUrlForRestaurant(e)),n.alt=e.alt+" Restaurant",n.src=DBHelper.imageUrlForRestaurant(e),t.append(n);const r=document.createElement("h2");r.tabIndex=0,r.innerHTML=e.name,t.append(r);const a=document.createElement("p");a.innerHTML=e.neighborhood,t.append(a);const s=document.createElement("p");s.innerHTML=e.address,t.append(s);const o=document.createElement("a");return o.setAttribute("aria-label",`${e.name} Restaurant Details Page`),o.innerHTML="View Details",o.href=DBHelper.urlForRestaurant(e),t.append(o),t}),addMarkersToMap=((e=self.restaurants)=>{e.forEach(e=>{const t=DBHelper.mapMarkerForRestaurant(e,self.map);google.maps.event.addListener(t,"click",()=>{window.location.href=t.url}),self.markers.push(t)})});