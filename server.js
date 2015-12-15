var express = require('express');
var bodyParser = require('body-parser');
var Yelp = require('yelp');
var app = express();

var server = app.listen(process.env.PORT, process.env.IP);

var parseItem = function (item) {
  var name = item.name;
  var rating = item.rating;
  var snippet = item.snippet_text;
  var location = item.location;
  var phone = item.display_phone;
  var line0 = '-------------------\n';
  var line1 = name + ', ' + rating + ' stars\n';
  var line2 = snippet + '\n';
  var line3 = '';
  location.display_address.forEach(function(line) {
    line3 = line3 + line + ', ';
  });
  line3 = line3 + phone + '\n';
  return line0 + line1 + line2 + line3;
};

var yelp = new Yelp({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  token: process.env.TOKEN,
  token_secret: process.env.TOKEN_SECRET,
});

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.get('/', function (req, res) {
  res.send('Success!');
});

app.post('/', function (req, res) {
  var str = req.body.text;
  var split = str.indexOf(' ');
  var zip = str.substr(0, split);
  var terms = str.substr(split + 1, str.length);
  var greeting = "Hi " + req.body.user_name + "! Here are some suggestions for " + terms + " near " + zip + ":\n";
  var text = '' + greeting;

  var searchObj = {
    category_filter: 'restaurants',
    location: zip,
    radius_filter: 8000,
    sort: 2,
    limit: 5,
    term: terms
  };

  yelp.search(searchObj)
    .then(function(response) {
      for (var i = 0; i < response.businesses.length; i++) {
        text += parseItem(response.businesses[i]);
      }
      res.send(text);
    })
    .catch(function(err) { console.log(err); });
});
