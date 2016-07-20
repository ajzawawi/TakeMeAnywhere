var express = require('express');
var mongoose = require('mongoose');
var axios = require('axios');
var request = require('request');

var app = express();

var apikey = 'ta293846389262362620117729258148';

require('./config/middleware.js')(app, express);
require('./config/routes.js')(app, express);

// var uristring =
//     process.env.MONGO_URI ||
//     'mongodb://localhost/takeMeAnywhere';

// mongoose.connect(uristring, function (err, res) {
//       if (err) {
//       console.log ('ERROR connecting to: ' + uristring + '. ' + err);
//       } else {
//       console.log ('Succeeded connected to: ' + uristring);
//       }
//     });



var getFlights = function(origin, dest, depart, returned, priceLimit, adults, kids, cb ){
  if(origin) origin+='-iata';
  if(dest) dest+='-iata';
  if(!priceLimit) priceLimit = 150;

 request.post('http://partners.api.skyscanner.net/apiservices/pricing/v1.0/',{
  form:{
      apiKey: apikey,
      country: 'US',
      currency: 'USD',
      locale : 'en-US',
      originplace: origin ||'SFO-iata',
      destinationplace: dest || 'LAX-iata',
      outbounddate : depart || '2016-08-24',
      inbounddate: returned || '2016-08-30',
      adults: adults || 1,
      children: kids || 0
    }
  }, function(err, res, body){
    if(!err){
      //filters from body and returns 5 lowest prices
      request.get(res.headers.location+'?apiKey='+apikey+'&pageindex=0&pagesize=5&sortorder=asc&sorttype=price' ,function(err, res, body){

      body =  JSON.parse(body);

       var agents = body.Agents;
       var carriers = body.Carriers;
       var results = [];

        body.Itineraries.forEach(function(flight){
          //only push items within price limit
          if(flight.PricingOptions[0].Price <= priceLimit){
            //create temp storage to push into results
            var storage = {};

            //grabs airline code from ID
            var airline = flight.OutboundLegId[17]+flight.OutboundLegId[18];

            //get price and booking link
            storage.price = flight.PricingOptions[0].Price;
            storage.url = flight.PricingOptions[0].DeeplinkUrl;

            //get agency id
            var agentID =  flight.PricingOptions[0].Agents[0];

            //grab agency name and logo
            //break, and save time if possible
            for(var i=0;i<agents.length;i++){
              if(agentID === agents[i].Id){

                storage.agent = agents[i].Name
                storage.agentImg = agents[i].ImageUrl;
                break;
              }
            }

            //get carrier info
            for(var i=0;i<carriers.length;i++){
              if(airline === carriers[i].Code){
                storage.airline = carriers[i].Name;
                storage.airlineImg = carriers[i].ImageUrl;
                break;
              }
            }

            results.push(storage);
          }

       });

       // results.forEach(function(data){
       //  console.log(data);
       // });


        cb(results);


      })
    }else{
      console.log('err',err);
    }
  });

}


app.post('/api/flights', function(req,res){
  var params = req.body;

  getFlights(params.origin, params.dest, params.depart, params.returned, params.price, function(data){

    res.send(200, data);
  });

})



var port = process.env.PORT || 3000;


app.listen(port, function() {
  console.log('connected suckas!')
})



module.exports = app;