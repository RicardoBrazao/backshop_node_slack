var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
  name: { type: String, required: true},
  slack_id: {type: String, required: true},
  first_name: {type: String, required: true},
  last_name: {type: String, required: true},
  real_name: {type: String, required: true},
  email: {type: String, required: false}
});

mongoose.model('User', UserSchema);

mongoose.connect('mongodb://localhost:27017/slack_api', function(err){
  console.log(err);
});

var User = mongoose.model('User');

module.exports = User;