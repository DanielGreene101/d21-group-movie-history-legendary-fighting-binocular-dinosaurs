"use strict";

var options = {
  shouldSort: true,
  threshold: 0.05,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: ["title"]
};


var template = require('./dombuilder');
var firebase = require('./firebase.js');
function initialSearch(searchInput) {
	return new Promise((resolve,reject)=>{
      
        $.ajax({  
            url: `https://api.themoviedb.org/3/search/movie?api_key=01fccab4977fb9e675b2a37846f08da4&language=en-US&query=${searchInput}&page=1&include_adult=false`,
        }).done((songdata)=>{
            resolve(songdata.results);
        });
    });
}
    
//building search params
function castSearch(movieid) {
        return new Promise((resolve,reject)=>{
        $.ajax({
            url:"https://api.themoviedb.org/3/movie/" +`${movieid}` + "/credits?api_key=c93dee63a7012453634a328e5dd78eef"
         }).done((url)=>{  
            resolve(url);
                
        });
    });
}

function singleMovieSearch(movieid) {
    return new Promise((resolve,reject)=>{
        $.ajax({
            url:"https://api.themoviedb.org/3/movie/" +`${movieid}` + "?api_key=c93dee63a7012453634a328e5dd78eef"
         }).done((movieObj)=>{ 
            let mymovieObj = movieObj;
            castSearch(movieid).then((item)=>{
                    mymovieObj.cast = item.cast;
                    resolve(mymovieObj);
            });
        });
    });
}


var carddata={};
//default search bar
$("#searchInput").on("keydown",(e)=>{
    if (e.keyCode == 13) {
        e.preventDefault();
        let search = $("#searchInput").val();
        initialSearch(search).then((data)=>{
            carddata = data;
            data.forEach((item,index)=>{
    
                    
                castSearch(item.id).then((castid)=>{
                    if (castid.cast.length>0) {
                        carddata[index].cast = castid.cast;
                    }   
                    // console.log("carddata from first", carddata[index].cast);
                    if (carddata[index].cast!==undefined ) {
                        // console.log("got here!!!!!!");
                            
                        for (var i = 0; i<5;i++) {
                            // console.log("cast members", carddata[index].cast[i]);
                              template(carddata);  
                        }

                    }
                });
                    
                    
            });
                
                
        });
    }
});
//watched search bar
$("#watchedSI").on("keydown",(e)=>{
    if (e.keyCode == 13) {
        e.preventDefault();
        let search = $("#watchedSI").val();
        firebase.getMovieByUser(firebase.currentUsers(search))
        .then((data)=>{
            carddata = data;
            let array = $.map(data, function(value, index) {
                return [value];
            });
            var fuse = new Fuse(array, options);
            let result = fuse.search(search);
            result.filter(()=>{
                return array.star;
            });
            template(result);
        }
    );
}});
//unwatched search bar
$("#unwatchedSI").on("keydown",(e)=>{
    if (e.keyCode == 13) {
        e.preventDefault();
        let search = $("#unwatchedSI").val();
        firebase.getMovieByUser(firebase.currentUsers(search))
        .then((data)=>{
            carddata = data;
            let array = $.map(data, function(value, index) {
                return [value];
            });
            var fuse = new Fuse(array, options);
            let result = fuse.search(search);
            result.filter(()=>{
                return array.star == null;
            });
            template(result);
        }
    );
}});

module.exports ={castSearch, singleMovieSearch};




