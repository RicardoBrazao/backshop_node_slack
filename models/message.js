var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var MessageSchema = new Schema({
  ts: { type: String, required: true}
});



mongoose.model('Message', MessageSchema);

mongoose.connect('mongodb://localhost:27017/slack_api', function(err){
  console.log(err);
});

var Message = mongoose.model('Message');

Message.mostRecentMessage = mostRecentMessage;

function mostRecentMessage(cb){
  Message
    .find()
    .sort({ts: 'desc'})
    .select({ts: 1})
    .findOne(function(err, item){
      cb(item);
    })
}

module.exports = Message;