var request = require("request");


var geocodeAddress = (address, callback) => {
    var encodeAddress = encodeURIComponent(address);

    request({
        url: "https://maps.googleapis.com/maps/api/geocode/json?address=" + encodeAddress,
        json: true
    }, (error, response, body) => {
        if (error){
            
        } else if (body.status === "ZERO_RESULTS"){
            
        } else if (body.status === "OK"){
            callback(body.results[0].geometry.location.lat , body.results[0].geometry.location.lng);
        }
    });
};

module.exports = {
    geocodeAddress
};
