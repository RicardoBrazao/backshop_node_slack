var assert = require('chai').assert;
var express = require('express');
var https = require('https');
var app = express();

var slack_token = 'xoxp-2199138713-2201174927-2925327744-b855a9';

var user_endpoint_options = {
    host: 'slack.com',
    path: '/api/users.list?token='+slack_token
}

var messages_endpoint_options = {
    host: 'slack.com',
    path: '/api/channels.history?token='+slack_token+'&channel=C025V42M7&count=1000'
}

describe('Slack API communication tests', function(){

  it('fetches all linkedcare awsome team members', function(done){
    var user_request_callback = function(response){
      var users_json = '';

      //another chunk of data has been recieved, so append it to `str`
      response.on('data', function (chunk) {
        users_json += chunk;
      });

      //the whole response has been recieved, so we just print it out here
      response.on('end', function () {
        var users = JSON.parse(users_json);
        assert.equal(users.members.length, 15);
        done();
      });
    }

    https.request(user_endpoint_options, user_request_callback).end();
  });


  it('fetches the last 1000 nasty messages from #random', function(done){
    var message_request_callback = function(response){
      var messages_json = '';

      //another chunk of data has been recieved, so append it to `str`
      response.on('data', function (chunk) {
        messages_json += chunk;
      });

      //the whole response has been recieved, so we just print it out here
      response.on('end', function () {
        var messages = JSON.parse(messages_json).messages;
        assert.equal(messages.length, 1000);
        done();
      });
    }
    https.request(messages_endpoint_options, message_request_callback).end();
  });
})
