/*
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

UserSchema = new Schema({
  'first_name'    :{ type: String, required: true },
  'last_name'     :{ type: String, required: true },
  'email'         :{ type: String, required: true }, 
  'password'      :{ type: String, required: true }
});

var User = mongoose.model('User', UserSchema);

exports.init = function(io) {
  io.sockets.on('connection', function(socket) {
    //add new user to the database
    socket.on('addNewUser', function(userinfo){
      console.log(userinfo);
      User.findOne({'email': userinfo.email}, function(err, user){
        if (user) {
          console.log('email already in use!')
        } else {
          new User({
            'email' : userinfo.email,
            'password' : userinfo.password,
            'first_name' : userinfo.firstname,
            'last_name' : userinfo.lastname,
          }).save( function(err){
            console.log('user saved');
            
          })
        }        
      });
    });
  })
}
*/