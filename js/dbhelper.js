/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_ROOT_URL(){
    return `http://localhost:1337/`;
  }
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
     return `http://localhost:${port}/restaurants`; 
    // return `https://limitless-harbor-91860.herokuapp.com/restaurants`; // test heroku app
  }


  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback,id) {
    let dataUrl = DBHelper.DATABASE_URL;
    if(id)
    dataUrl = dataUrl + "/" + id;
    
    fetch(dataUrl)
  .then(r => r.json())
  .then(restaurants => callback(null, restaurants))
    .catch((err)=>{
      console.log('%c When restaurant error in fetch ', 'background: #222; color: #bada55');
      var dbe;
      const dbOpenRequest = indexedDB.open('restaurants-db', 1);
	    dbOpenRequest.onerror = (error) => {
	    	console.error('Failed to open indexed database offline!');
	    	console.error('Error message', error.target);
      };
      
       dbOpenRequest.onsuccess = (event) => {
        dbe = event.target.result;
        var myIndex = dbe.transaction(['res'], 'readonly').objectStore('res').index('id');
        let indexData = [];
      myIndex.openCursor().onsuccess =(event) => {
        var cursor = event.target.result;
        if(cursor) {
          indexData.push(cursor.value);
          cursor.continue();
        } else {
          callback(null,indexData)   
        }
      };
      
      };
      
      callback(`Failed beacause ${err}`,null)
    })
    
    // let xhr = new XMLHttpRequest();
    // xhr.open('GET', DBHelper.DATABASE_URL);
    // xhr.onload = () => {
    //   if (xhr.status === 200) { // Got a success response from server!
    //     const json = JSON.parse(xhr.responseText);
    //     const restaurants = json.restaurants;
    //     callback(null, restaurants);
    //   } else { // Oops!. Got an error from server.
    //     const error = (`Request failed. Returned status of ${xhr.status}`);
    //     callback(error, null);
    //   }
    // };
    // xhr.send();
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    if(restaurant.photograph == undefined)
    return (`/img/res.png`);
    return (`/img/${restaurant.photograph}.jpg`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

  //for update favorite
  static updateFavouriteStatus (id,fav) {
    
    fetch(`${DBHelper.DATABASE_URL}/${id}?is_favorite=${fav}`,{
      method : 'PUT'
    }).then(res =>{
      var dbe;
      const dbOpenRequest = indexedDB.open('restaurants-db', 1);
	    dbOpenRequest.onerror = (error) => {
	    	console.error('Failed to open indexed database offline!');
	    	console.error('Error message', error.target);
      };

      dbOpenRequest.onsuccess = (event) => {
        dbe = event.target.result;
        
        var myIndex = dbe.transaction(['res'], 'readwrite').objectStore('res').index('id');
        let indexData = [];
      myIndex.openCursor().onsuccess =(event) => {
        var cursor = event.target.result;
        if(cursor && cursor.value.id ==id ) {
          cursor.value.is_favorite = fav;
          indexData.push(cursor.value);
        } else {
          cursor.continue();
        }
      };
      
      };

    })
    }
    static fetchReviews(callback){
      
      fetch(`${DBHelper.DATABASE_ROOT_URL}reviews/`).then((response) => {
        return response.json()
      }).then(reviews => {
        callback(null, reviews);
      }).catch(error => {
        console.log('%c When reviews error in fetch ', 'background: #222; color: #bada55');
      var dbe;
      const dbOpenRequest = indexedDB.open('restaurants-db', 1);
	    dbOpenRequest.onerror = (error) => {
	    	console.error('Failed to open indexed database offline!');
	    	console.error('Error message', error.target);
      };
      
       dbOpenRequest.onsuccess = (event) => {
        dbe = event.target.result;
        var myIndex = dbe.transaction(['reviews'], 'readonly').objectStore('reviews').index('id');
        let indexData = [];
      myIndex.openCursor().onsuccess =(event) => {
        var cursor = event.target.result;
        if(cursor) {
          indexData.push(cursor.value);
          cursor.continue();
        } else {
          callback(null,indexData)   
        }
      };
      };
      callback(`Failed beacause ${err}`,null)
      })
    }


    static fetchReviewsByRestId(id) {
      return fetch(`${DBHelper.DATABASE_ROOT_URL}reviews/?restaurant_id=${id}`)
        .then(response => response.json())
        .then(reviews => {
          return Promise.resolve(reviews);
        })
        .catch(error => {
          return DBHelper.getStoredObjectById('reviews', 'restaurant', id)
            .then((storedReviews) => {
              console.log('looking for offline stored reviews');
              return Promise.resolve(storedReviews);
            })
        });
    }



    static addReview(review) {
      
      let reviewSend = {
        "name": review.name,
        "rating": parseInt(review.rating),
        "comments": review.comments,
        "restaurant_id": parseInt(review.restaurant_id)
      };
      
      var options = {
        method: 'POST',
        body: JSON.stringify(reviewSend),
        headers: new Headers({
          'Content-Type': 'application/json'
        })
      };
      fetch(`http://localhost:1337/reviews`, options).then((response) => {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.indexOf('application/json') !== -1) {
          return response.json();
        } else { return 'API call successfull'}})
      .then((data) => {
        
      var dbe;
      const dbOpenRequest = indexedDB.open('restaurants-db', 1);
	    dbOpenRequest.onerror = (error) => {
	    	console.error('Failed to open indexed database offline!');
	    	console.error('Error message', error.target);
      };
      
       dbOpenRequest.onsuccess = (event) => {
        dbe = event.target.result;
        var ObjectmyIndex = dbe.transaction(['reviews'], 'readwrite').objectStore('reviews');
        var myIndex = ObjectmyIndex.index('id');
        let indexData = [];
      myIndex.openCursor(null, 'prev').onsuccess =(event) => {
        var cursor = event.target.result;
        
        if(cursor) {
          reviewSend.id = cursor.value.id + 1;
        } 
        ObjectmyIndex.add(reviewSend)
      };
      };      

    })
      .catch(error => console.log('error:', error));
    }
    


}
