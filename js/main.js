let restaurants,neighborhoods,cuisines
var map
var markers = []

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  window.addEventListener('online', function(e) { 
    var condition = navigator.onLine ? "online" : "offline";
    if(condition == "online"){
     DBHelper.sendOfflineReviews();
     DBHelper.sendOfflineFavourites();
    }
  });

  fetchNeighborhoods();
  fetchCuisines();
  if (navigator.serviceWorker) {
      navigator.serviceWorker.register('/sw.js')
      .then(() => console.log('Service Worker works !!'));
    }
  createIndexedDB();
});



createIndexedDB = () => {
	let db, restaurants;
	const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
	if (!indexedDB) {
		console.error('Indexed databases not supported');
	}
	DBHelper.fetchRestaurants((err, result) => {
		restaurants = result;
  });
  DBHelper.fetchReviews((err, result) => {
    reviews = result;
  })
	const dbOpenRequest = indexedDB.open('restaurants-db', 1);
	dbOpenRequest.onerror = (error) => {
		console.error('Failed to open indexed database !');
		console.error('Error message', error.target);
	};
	dbOpenRequest.onsuccess = (event) => {
    db = event.target.result;
  };
  
	dbOpenRequest.onupgradeneeded = (event) => {
    db = event.target.result;
    //for restaurents
    const objectStore = db.createObjectStore('res', { keyPath: 'id' });
    objectStore.createIndex('id', 'id', { unique: false });
    objectStore.transaction.addEventListener('complete',(event) => {
			const restaurantsObjectStore = db.transaction([ 'res' ], 'readwrite').objectStore('res');
			addToIndexedDB(restaurantsObjectStore, restaurants);
    });
    //for reviews
    const reviewStore = db.createObjectStore('reviews', { keyPath: 'id' });
    reviewStore.createIndex('id', 'id', { unique: false });
    reviewStore.transaction.addEventListener('complete',(event) => {
      const reviewsObjectStore = db.transaction([ 'reviews' ], 'readwrite').objectStore('reviews');
      addToIndexedDB(reviewsObjectStore, reviews);
    }); 
  };
};

addToIndexedDB = (store, data) => {
	data.forEach((elm) => {
		store.add(elm);
	});
};




/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
}

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
// for the home page
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');
  li.tabIndex = '0';
  const image = document.createElement('img');
  image.className = 'restaurant-img lazy';
  image.setAttribute('alt', `${restaurant.name} Restaurant`);
	image.setAttribute('data-echo', DBHelper.imageUrlForRestaurant(restaurant));
  
 //image.src =  '/img/res.png'; 
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  li.append(image);

  const name = document.createElement('h2');
  name.tabIndex = 0;
  name.innerHTML = restaurant.name;
  li.append(name);

  //favorite button
let fav = document.createElement('button');
fav.innerHTML = '♥';
fav.classList.add('fav_btn');

printFavElementClass(fav,restaurant.is_favorite);
li.append(fav);

fav.onclick= function (){
  let isFav = false;
  if(restaurant.is_favorite == "false" || restaurant.is_favorite == false){
isFav = true;
  }else{
isfav = false
  }
  
  DBHelper.updateFavouriteStatus(restaurant.id, isFav);
  restaurant.is_favorite = isFav;
  changeFavElementClass(fav,restaurant.is_favorite);
  };

  

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  more.setAttribute('aria-label', `${restaurant.name} Restaurant Details Page`);
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more)

  return li
}

printFavElementClass = (el, fav) =>{
  if (fav == "false") {
    el.classList.remove('favorite_yes');
    el.classList.add('favorite_no');
    el.setAttribute('aria-label', 'mark as favorite');

  } else {
    console.log('toggle yes upd');
    el.classList.remove('favorite_no');
    el.classList.add('favorite_yes');
    el.setAttribute('aria-label', 'remove as favorite');

  }
}
changeFavElementClass = (el, fav) => {
  if (! fav) {
    el.classList.remove('favorite_yes');
    el.classList.add('favorite_no');
    el.setAttribute('aria-label', 'mark as favorite');

  } else {
    console.log('toggle yes upd');
    el.classList.remove('favorite_no');
    el.classList.add('favorite_yes');
    el.setAttribute('aria-label', 'remove as favorite');

  }
}


/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
}

// Register Service Worker
// if (navigator.serviceWorker) {
//   window.addEventListener('load', function () {
//   navigator.serviceWorker.register('/sw.js')
//   .then(() => console.log('Service Worker works !!'));
//   });
// }
