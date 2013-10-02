var user = require('../models/user');
var superagent = require('superagent');
var currentuser; 
var cities;
var viewuser;
var citieshash = {};
var travelinghash = {};
var socialhash = {};

exports.index = function(req, res) {
  res.render('index', {'title':'welcome'});
}

exports.getCities = function(req, res) {
  var usercitylist = [];
  var citieshash = {};
  var usertravelinglist = [];
  var travelinghash = {};
  var usersociallist = [];
  var socialhash = {};
  user.find({}, function (err, users) {
    if (err) {}
    // CODE FOR CITIESHASH
    users.forEach(function(usr){
      if (usr.current_location != undefined) {
        if (usr.current_location.length > 0){
          usercitylist.push(usr.current_location);
          if (usr.current_location in citieshash) {
            citieshash[usr.current_location].push(usr);
          }
          else {
            citieshash[usr.current_location] = [];
            citieshash[usr.current_location].push(usr);
          }
        }
      }
    });
    // CODE FOR TRAVELINGHASH
    users.forEach(function(usr){
      if (usr.upcoming_trips.location != undefined) {
        if (usr.upcoming_trips.location.length > 0 ){
          usertravelinglist.push(usr.upcoming_trips.location);
          if (usr.upcoming_trips.location in travelinghash) {
            travelinghash[usr.upcoming_trips.location].push(usr);
          }
          else {
            travelinghash[usr.upcoming_trips.location] = [];
            travelinghash[usr.upcoming_trips.location].push(usr);    
          }
        }
      }
    });
    users.forEach(function(usr){
      var latestcheckin;
      if (usr.foursquare != undefined) {
        console.log(usr.first_name + "'s foursquare is " + usr.foursquare);
        request.get('https://api.foursquare.com/v2/users/self/checkins')
        .query({
          oauth_token: usr.foursquare,
          v: '20130506'
        })
        .end(function(error, response){
          if (error) {
            response.send('an error was thrown: ' + error.message);
          } else {
            var latestcheckinwhole = response.body.response.checkins.items[0].shout;
            if (latestcheckinwhole.indexOf('#travelingtartans') != -1) {
              latestcheckin = response.body.response.checkins.items[0];
              console.log('latest checkin ' + latestcheckin);
              var checkinlocation = latestcheckin.venue.location.city + ", " + latestcheckin.venue.location.state;
              usersociallist.push(latestcheckin.venue.name);
              if (checkinlocation in socialhash) {
                socialhash[checkinlocation].push(usr);
                console.log(socialhash);
              }
              else {
                socialhash[checkinlocation] = [];
                socialhash[checkinlocation].push(usr);
                console.log(socialhash);
                res.render('map', {'cities': JSON.stringify(citieshash), 'social': JSON.stringify(socialhash), 'traveling': JSON.stringify(travelinghash) });
              }
            }
            else {
              return false;
            }
          }
        });
      }
    });
  });
}

exports.updateCheckins = function(req,res) {
  console.log('in updateCheckins');

  user.find({}, function(err, users) {
    if (err){}
    users.forEach(function(usr){
      var latestcheckin;
      if (usr.foursquare != undefined) {
        console.log(usr.first_name + "'s foursquare is " + usr.foursquare);
        request.get('https://api.foursquare.com/v2/users/self/checkins')
        .query({
          oauth_token: usr.foursquare,
          v: '20130506'
        })
        .end(function(error, response){
          if (error) {
            response.send('an error was thrown: ' + error.message);
          } else {
            latestcheckin = response.body.response.checkins.items[0];
            console.log('latest checkin ' + latestcheckin);
            var checkinlocation = latestcheckin.venue.location.city + ", " + latestcheckin.venue.location.state;
            usersociallist.push(latestcheckin.venue.name);
            if (checkinlocation in socialhash) {
              socialhash[checkinlocation].push(usr);
            }
            else {
              socialhash[checkinlocation] = [];
              socialhash[checkinlocation].push(usr);
              console.log(socialhash);
            }
          }
        });
      }
    });
    console.log(citieshash);
    console.log(travelinghash);
    res.render('map', {'cities': JSON.stringify(citieshash), 'traveling': JSON.stringify(travelinghash), 'social': JSON.stringify(socialhash), 'user' : currentuser });
  });
}

function getLatestCheckin(req, res, foursquare_token) {
  console.log('in getLatestCheckin');
  request.get('https://api.foursquare.com/v2/users/self/checkins')
  .query({
    oauth_token: foursquare_token,
    v: '20130506'
  })
  .end(function(error, response){
    if (error) {
      response.send('an error was thrown: ' + error.message);
    } else {
      return response.body.response.checkins.items[0];
    }
  });
}

exports.storeNewUser = function(req, res) {
   user.findOne({'email': req.body.email}, function(err, usr){
     if (usr) {
       console.log('email already in use!');
     } else {
       console.log('creating user');
       newuser = new user({
         'email' : req.body.email,
         'password' : req.body.password,
         'first_name' : req.body.first_name,
         'last_name' : req.body.last_name, 
         'status'   : req.body.status
       });
       newuser.save( function(err){
         console.log('user saved: ' + newuser);
         req.login(newuser, function(err) {
           if (err) { return next(err); }
           currentuser = newuser;
           console.log('current user ' + currentuser); 
           return res.redirect('/liaccount');
         });
       });
     }        
   });  
}

exports.loggedIn = function(req, res) {
  currentuser = req.user;
  console.log('current user = ' + currentuser);
  res.render('account', {'user':currentuser, 'title':'Welcome back '});
}

exports.editProfile = function(req, res) {
  res.render('editprofile', { 'user': currentuser });
}

exports.editForm = function(req, res) {
  user.findOne({'email': currentuser.email}, function(err, usr){
    if (usr) {
      console.log(req.body);
      usr.first_name = req.body.first_name;
      usr.last_name = req.body.last_name;
      usr.status = req.body.status;
      usr.current_location = req.body.current_location;
      usr.current_occupation = req.body.currentoccupation;
      usr.home_college = req.body.homecollege;
      usr.graduation_year = req.body.graduation_year;
      usr.primary_major = req.body.primary_major;
      usr.secondary_major = req.body.secondary_major;
      usr.email = req.body.email;
      usr.save( function(err) {
        console.log(err);
      });
      console.log("user saved, user is " + usr);
      currentuser = usr;
      res.render('account', {'user': currentuser});
      
    }        
  });
  console.log("form submitted. current user is " + currentuser);
}

exports.showProfile = function(req, res) {
  res.render('account', { 'user': currentuser });
  console.log(currentuser);
}

exports.userProfiles = function(req, res) {
  var viewuserid = req.query.id;
  console.log('viewuserid = ' + viewuserid);
  user.findOne({'_id' : viewuserid}, function(err, usr) {
    if (usr) {
      console.log('viewing profile for ' + usr);
      viewuser = usr;
      res.render('userprofile', {'user': viewuser});
    }
  });
}

exports.addTrip = function(req, res) {
  res.render('addtrip', { 'user' : currentuser });
}

exports.submitTrip = function(req, res) {
  user.findOne({'email': currentuser.email}, function(err, usr){
    if (usr) {
      console.log(req.body);
      usr.upcoming_trips.location = req.body.location;
      usr.upcoming_trips.from = req.body.fromdate;
      usr.upcoming_trips.to = req.body.todate;
      usr.upcoming_trips.why = req.body.why;
      usr.save( function(err) {
        console.log(err);
      });
      console.log("trip saved, user's new trip is " + usr.upcoming_trips);
      console.log(usr.upcoming_trips.length);
      currentuser = usr;
      res.render('account', {'user': currentuser});
      
    }        
  });
  console.log("form submitted. current user is " + currentuser);
}


var FOURSQUARE_CLIENT_ID = "RHDWWG2YDEERMJW0YJAD5B43H3CYJ25CKUL5DGCUTZNOJ2DI";
var FOURSQUARE_CLIENT_SECRET = "CB1QJL4K32E4DGM25550J0OZBDQIHHHD5VR2CSCA5S45PKLW";
var REDIRECT_URI = "http://rebchenitconsulting.aws.af.cm/callback";
exports.testFoursquare = function(req, res) {
  console.log('in testfoursquare');
  //var FOURSQUARE_ACCESS_TOKEN = "KL4T4RR5Y5SXCXO0VO5GCUBAZXY02NAQHASFQYG3OF0THV4T";
  
  var url = 'https://foursquare.com/oauth2/authenticate?n&client_id=' + FOURSQUARE_CLIENT_ID +
  '&response_type=code&redirect_uri=' + REDIRECT_URI;
  res.redirect(url);
}
var request = require('superagent');
exports.foursquareCallback = function(req, res) {
  request.get('https://foursquare.com/oauth2/access_token')
  .query({
    client_id: FOURSQUARE_CLIENT_ID,
    client_secret: FOURSQUARE_CLIENT_SECRET,
    grant_type: 'authorization_code',
    redirect_uri: REDIRECT_URI,
    code: req.query.code
  })
  .end(function(error, response){
    if (error) {
      response.send('an error was thrown: ' + error.message);
    } else {
      console.log(response.body.access_token);
      user.findOne({'email': currentuser.email}, function(err, usr){
        if (usr) {
          usr.foursquare = response.body.access_token;
          usr.save( function(err) {
            console.log(usr);
            currentuser = usr;
          });
        }        
      });
      res.render('account', {'user': currentuser});
    }
  });
}

exports.connectFoursquare = function(req, res) {
  var redirect = window.location.href.replace(window.location.hash, '');
  var url = 'https://foursquare.com/oauth2/authenticate?n&client_id=' + FOURSQUARE_CLIENT_ID +
  '&response_type=code&redirect_uri=' + REDIRECTURI;
  window.location.href = url;
  
}


