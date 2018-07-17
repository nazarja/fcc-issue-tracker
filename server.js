'use strict';


// Requires
var express = require('express');
var bodyParser = require('body-parser');
var expect = require('chai').expect;
var cors = require('cors');
var helmet = require('helmet');
var mongo = require('mongodb').MongoClient;


// Testing Requires
var apiRoutes = require('./routes/api.js');
var fccTestingRoutes = require('./routes/fcctesting.js');
var runner = require('./test-runner');


// Express
var app = express();

app.use('/public', express.static(process.cwd() + '/public'));
app.use(cors({origin: '*'})); //For FCC testing purposes only
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



// Helmet
app.use(helmet());
app.use(helmet.xssFilter());


//  EXPRESS //

// Index.html 
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

// Issue.html
app.route('/:project/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/issue.html');
  });



// Instantiate Routes
apiRoutes(app);  //Routing for API 
fccTestingRoutes(app); //For FCC testing purposes

  
//404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});


// Server Listener
app.listen(process.env.PORT || 3000, function () {
  console.log("Listening on port " + process.env.PORT);
  if(process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch(e) {
        var error = e;
          console.log('Tests are not valid:');
          console.log(error);
      }
    }, 3500);
  }
});
      


module.exports = app; //for testing
