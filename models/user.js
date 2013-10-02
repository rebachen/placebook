var mongoose = require('mongoose');
var Schema = mongoose.Schema;

User = new Schema({
  'first_name'          :{ type: String, required: true },
  'last_name'           :{ type: String, required: true },
  'email'               :{ type: String, required: true }, 
  'password'            :{ type: String, required: true },
  'status'              :{ type: String, required: true }, 
  'current_location'    :{ type: String },
  'social_location'     :{ 
                           'created_at'    :{ type: String },
                           'shout'         :{ type: String }, 
                           'location_name' :{ type: String }, 
                           'lat'           :{ type: String }, 
                           'long'          :{ type: String }
                          },
  'current_occupation'  :{ type: String },
  'home_college'        :{ type: String }, 
  'graduation_year'     :{ type: String }, 
  'primary_major'       :{ type: String }, 
  'secondary_major'     :{ type: String }, 
  'preferred_email'     :{ type: String },
  'foursquare'          :{ type: String }, 
  'twitter'             :{ type: String }, 
  'facebook'            :{ type: String }, 
  'upcoming_trips'      :{
                           'location'     :{ type: String }, 
                           'from'         :{ type: String }, 
                           'to'           :{ type: String }, 
                           'why'          :{ type: String }
                         }
});

User.methods.validPassword = function(password){
  return (this.password === password);
};

//var User = mongoose.model('User', UserSchema);

module.exports = mongoose.model('User', User);