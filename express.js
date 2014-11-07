var https = require('https');
var express = require('express');
var app = express();
var User = require('./models/user');
var Message = require('./models/message');

var Config = require('./config');

var slack_token = Config.slack_token;


app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.render('home');
});

app.get('/users', function(req, res){
  User.find().sort({name: 'asc'}).find(function(err,items){
    res.render('user_list', { users: items });
  });
});

app.get('/message_for_users', function(req, res){
  var count_array = [];
  Message.aggregate(
    {
      $group: {_id: "$user", count: { "$sum": 1 }}
    },
    function(err, result){

      for (var i = 0; i < result.length; ++i) {
        if(result[i]._id != null){
          count_array.push(result[i]);
        }
      };

      Message.aggregate(
        {
          $group: {_id: "$message.user", count: { "$sum": 1 }}
        },
        function(err, result){

          for (var i = 0; i < result.length; ++i) {
            if(result[i]._id != null){
              for (var j = 0; j < count_array.length; ++j) {
                if( result[i]._id == count_array[j]._id ){
                  count_array[j].count += result[i].count;
                  break;
                }
              };
            }
          };

          User.aggregate(
            {
              $group: { _id: '$id' , name: { '$first':'$name' } }
            },
            function(err, result){
              for (var i = 0; i < result.length; i++) {
                for (var j = 0; j < count_array.length; j++) {
                  if( count_array[j]._id == result[i]._id ){
                    count_array[j]._id = result[i].name;
                    break;
                  }
                };
              };

              res.render('history', { count_array: count_array });

            }
          );
        }
      )
    }
  )
});

app.post('/refresh_total_messages',function(req, res){

  Message.mostRecentMessage(function(item){
    console.log("------ In callback -------");
    console.log(item);
    console.log(item.type);

    messages_endpoint_options.path += ('&oldest='+item.ts);

    console.log(messages_endpoint_options);
    https.request(messages_endpoint_options, message_request_callback).end();
    res.json(item);
  });
});

app.get('/channel_index', function(req, res){
  var channel_endpoint_options = {
    host: 'slack.com',
    path: '/api/users.list?token='+slack_token
  }


});

// Import users on server start

var user_endpoint_options = {
    host: 'slack.com',
    path: '/api/users.list?token='+slack_token
}

var user_request_callback = function(response){
  var users_json = '';

  //another chunk of data has been recieved, so append it to `str`
  response.on('data', function (chunk) {
    users_json += chunk;
  });

  //the whole response has been recieved, so we just print it out here
  response.on('end', function () {
    var users = JSON.parse(users_json);
    User.collection.insert(users.members, function(err, inserted){
      if(err){
        console.log(err);
      }
      else{
        console.log('Users inserted = '+inserted.length);
      }
    });
  });
}

https.request(user_endpoint_options, user_request_callback).end();

// end


// Import messages on server start

var messages_endpoint_options = {
    host: 'slack.com',
    path: '/api/channels.history?token='+slack_token+'&channel=C025V42M7&count=1000'
}

var message_request_callback = function(response){
  var messages_json = '';

  //another chunk of data has been recieved, so append it to `str`
  response.on('data', function (chunk) {
    messages_json += chunk;
  });

  //the whole response has been recieved, so we just print it out here
  response.on('end', function () {
    var messages = JSON.parse(messages_json).messages;
    console.log("Messages received = "+messages.length);
    if(messages.length > 0){
      Message.collection.insert(messages, function(err, inserted){
        if(err){
          console.log("!!!!!!!!!!!!!!!!! ERROR  !!!!!!!!!!!!!!!!!!");
          console.log(err);
        }
        else{
          console.log('Messages inserted = '+inserted.length);
        }
      });
    }
    else{
      console.log('No messages received');
    }
  });

}

https.request(messages_endpoint_options, message_request_callback).end();

// end

process.on('SIGINT', function(){
  console.log("Shut Down");
  User.remove({}, function(err){ console.log(err); });
  Message.remove({}, function(err){ console.log(err); });
  process.exit();
});

app.listen(9000);