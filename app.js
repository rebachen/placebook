/**
 * Module dependencies.
 */

var config = {
  'secrets' : {
    'clientId' : 'RHDWWG2YDEERMJW0YJAD5B43H3CYJ25CKUL5DGCUTZNOJ2DI', 
    'clientSecret' : 'CB1QJL4K32E4DGM25550J0OZBDQIHHHD5VR2CSCA5S45PKLW', 
    'redirectUrl' : 'http://rebchenitconsulting.aws.af.cm/callback'
  }
}

var express = require('express')
  , routes = require('./routes')
  , index = require('./routes/index')
  , login = require('./routes/login')
  , account = require('./routes/account')
  , signup = require('./routes/signup')
  , http = require('http')
  , path = require('path')
  , flash = require('connect-flash')
  , user = require('./models/user')
  , mongoose = require('mongoose')
  , passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , FoursquareStrategy = require('passport-foursquare').Strategy
  , foursquare = require('node-foursquare')(config)
//  , MongoDBConnection = require('./database/DatabaseConnector').MongoDBConnection;

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());  
  app.use(express.session({ secret: 'keyboard cat' }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

//***** MONGO DB CONNECTION 
if(process.env.VCAP_SERVICES){
    var env = JSON.parse(process.env.VCAP_SERVICES);
    var mongo = env['mongodb-1.8'][0]['credentials'];
}
else{
    var mongo = {
        "hostname":"localhost",
        "port":27017,
        "username":"",
        "password":"",
        "name":"",
        "db":"db"
    }
}
var generate_mongo_url = function(obj){
    obj.hostname = (obj.hostname || 'localhost');
    obj.port = (obj.port || 27017);
    obj.db = (obj.db || 'test');
    if(obj.username && obj.password){
        return "mongodb://" + obj.username + ":" + obj.password + "@" + obj.hostname + ":" + obj.port + "/" + obj.db;
    }
    else{
        return "mongodb://" + obj.hostname + ":" + obj.port + "/" + obj.db;
    }
}
var mongourl = generate_mongo_url(mongo);

//***** MONGOOSE ADDITIONS
//var monogoDbConnection = new MongoDBConnection();
mongoose.connect('mongodb://localhost/myapp');


app.configure('development', function(){
  app.use(express.errorHandler());
});



//***** PASSPORT ADDITIONS
passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  user.findById(id, function(err, user) {
    done(err, user);
  });
});
passport.use(new LocalStrategy({
  usernameField: 'email'
  }, 
  function(username, password, done) {
    user.findOne({ 'email': username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));
/*
//***** FOURSQUARE-PASSPORT ADDITIONS
var FOURSQUARE_CLIENT_ID = "RHDWWG2YDEERMJW0YJAD5B43H3CYJ25CKUL5DGCUTZNOJ2DI";
var FOURSQUARE_CLIENT_SECRET = "CB1QJL4K32E4DGM25550J0OZBDQIHHHD5VR2CSCA5S45PKLW";
//var FOURSQUARE_ACCESS_TOKEN = "KL4T4RR5Y5SXCXO0VO5GCUBAZXY02NAQHASFQYG3OF0THV4T";
passport.use(new FoursquareStrategy({
  clientID: FOURSQUARE_CLIENT_ID,
  clientSecret: FOURSQUARE_CLIENT_SECRET,
  callbackURL: "http://rebchenitconsulting.aws.af.cm/auth/foursquare/callback"
  }, 
  function(accessToken, refreshToken, profile, done) {
    console.log(accessToken);
    return done(null, profile);
  }
));
*/


//
app.get('/', routes.index);
// Log in/out actions
//app.get('/login', login.details);
app.post('/login',
  passport.authenticate('local', { successRedirect: '/liaccount',
                                   failureRedirect: '/'
                                  })
);
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
  console.log('LOGGED OUT!!!');
});
app.post('/suaccount', index.storeNewUser);
app.get('/liaccount', index.loggedIn);

// Foursquare connection actions
// This first step will redirect the user to foursquare.com
// After authorization, Foursquare will redirect the user back to the app at /auth/foursquare/callback
/*
app.get('/auth/foursquare', 
  passport.authenticate('foursquare'),
  function(req,res){
    // The request will be redirected to Foursquare for authentication, 
    //so this function won't be called
});
*/
// Redirects the user to account page
//app.get('/auth/foursquare/callback', index.testFoursquare);
app.get('/editprofile', index.editProfile);
app.get('/addtrip', index.addTrip);
app.post('/submittrip', index.submitTrip);
app.post('/editaccount', index.editForm);
app.get('/account', index.showProfile);
app.get('/map', index.getCities);
app.get('/userprofile', index.userProfiles);
//app.get('/connectfs', index.connectFoursquare);
app.get('/foursquareauth', index.testFoursquare);
app.get('/callback', index.foursquareCallback);
app.get('/foursquareupdate', index.updateCheckins);


var server = http.createServer(app);
server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

