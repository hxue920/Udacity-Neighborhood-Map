"use strict"

var map, infowindow, pre;
var markers = [];
var bootcampLocations = [{
  name: 'Dev Bootcamp',
  address: '633 Folsom St, San Francisco',
  location: {lat: 37.784517, lng: -122.397194},
  url: 'https://devbootcamp.com/',
  contact: '(415)800-6579'
}, {
  name: 'App Academy',
  address: '160 Spear St #14, San Francisco',
  location: {lat: 37.791305, lng: -122.393735},
  url: 'https://www.appacademy.io/',
  contact: ""
}, {
  name: 'Hack Reactor',
  address: '944 Market Street, 8th floor, San Francisco',
  location: {lat: 37.783697, lng: -122.408966},
  url: 'http://www.hackreactor.com/',
  contact: '(415)547-0254'
}, {
  name: 'MakerSquare',
  address: '611 Mission St #2, San Francisco',
  location: {lat: 37.787507, lng: -122.399838},
  url: 'https://www.makersquare.com/',
  contact: '(415)617-5456'
}, {
  name: 'General Assembly (school)',
  address: '225 Bush St 5th Fl, San Francisco',
  location: {lat: 37.790841, lng: -122.401280},
  url: 'https://generalassemb.ly/',
  contact: '(415)592-6885'
},];

// Knockout utility function not included in minified released version
ko.utils.stringStartsWith = function (string, startsWith) {
    string = string || "";
    if (startsWith.length > string.length)
        return false;
    return string.substring(0, startsWith.length) === startsWith;
}

//initial callback function for when google api successfully loads and creates map object
function initMap() {
  var location = {lat: 37.788673, lng: -122.400012};

  map = new google.maps.Map(document.getElementById('map'), {
    center: location,
    zoom: 15
  });

  infowindow = new google.maps.InfoWindow();

  //Create markers for each bootcamp location in bootcampLocations object by calling createdMarker()
  bootcampLocations.forEach(function(bootcamp) {
    createMarker(bootcamp);
  });
}

/*
  @desc creates marker to display on google map and calls createInfoWindow to create infowindow for each marker
  @para object bootcamp - used for creating marker properties
*/
function createMarker(bootcamp) {
  var marker = new google.maps.Marker({
    map: map,
    animation: google.maps.Animation.DROP,
    position: bootcamp.location,
    name: bootcamp.name,
    address: bootcamp.address,
    webpage: bootcamp.url,
    phone: bootcamp.contact

  });
  markers.push(marker);
  bootcamp.marker = marker;
  google.maps.event.addListener(marker, 'click', function() { //binds click event on each marker
    createInfoWindow(marker, infowindow);
  });
}

/*
  @desc creates infowindow and sets marker animation for each bootcamp location and makes ajax request to wikipedia for relevant article
  @para object marker - used for wiki ajax calls and populating infowindow with infomation
        object infowindow - displays bootcamp infomation
*/
function createInfoWindow(marker, infowindow) {
  var wikiUrl = "http://en.wikipedia.org/w/api.php?action=opensearch&search=" + marker.name + "&format=json&callback=wikiCallback";
  var wikiApiTimeout = setTimeout(function() { //Alerts user after 5 seconds if the ajax call to wikipedia is unsuccessful
    alert("Error retrieving wikipedia link.");
  }, 5000);

  $.ajax(wikiUrl, {
      dataType: "jsonp",
      success: function(response) {
        clearTimeout(wikiApiTimeout); //clears previous timeout ID when ajax call is successful
        var wikiPage = response[3][0];

        //sets previous clicked marker color back to default
      if (pre !== undefined) {
        pre.setIcon(null);
      }
      pre = marker;
      marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png'); //when clicked marker changes color and bounces
      if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
      } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
          marker.setAnimation(null);
        },1400);
      }

        infowindow.setContent("<div class='infoWindow'><h3 class='infoTitle'>" + marker.name + "</h3><br><p>" + marker.address +"</p><br><p>" + marker.phone + "</p><br><p><a href='" + marker.webpage + "'>Homepage</a></p><br><p><a href='" + wikiPage + "'>Wiki Page</a></p></div>");
        infowindow.open(map, marker);
      }
  });
}

//error function, fires when google map failed to load
function mapLoadFail() {
  alert("Google Map failed to load! Please check internet connection or firewall settings.");
}

//Knockout.js ViewModel object
var mapViewModel = function() {
  var self = this;

  self.bootcamps = ko.observable(bootcampLocations);
  self.filterQuery = ko.observable('');
  self.filteredItems = ko.computed(function() {
    var filter = self.filterQuery().toLowerCase();
    if (!filter) {
        markers.forEach(function(item) {
          item.setVisible(true);
        });
        return self.bootcamps();
    } else {
        return ko.utils.arrayFilter(self.bootcamps(), function(item) { //filters bootcamp array for elements that match the text input from search field
            if (ko.utils.stringStartsWith(item.name.toLowerCase(), filter)) {
              item.marker.setVisible(true);
              return true;
            } else {
              item.marker.setVisible(false);
              return false;
            }
        });
    }
  }, self);

  self.listClick = function(bootcamp) {
    map.setZoom(18);
    map.setCenter(bootcamp.location);
    createInfoWindow(bootcamp.marker, infowindow);
  }
};

ko.applyBindings(new mapViewModel());

//toggle sidebar
$("#menu-toggle").click(function(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
});