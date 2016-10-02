 
var MongoClient = require('mongodb').MongoClient
var assert = require('assert');
var express = require('express');


// Connection URL
var db_url = 'mongodb://localhost:27017/nomad-si-test';

var db;

// Use connect method to connect to the server
MongoClient.connect(db_url, function(err, connected_db) {
  assert.equal(null, err);
  console.log("Connected successfully to server");
  db = connected_db;
});


var current_question_id = 1;

var server = express();

var file_prefix = '/home/jakob/code/nomad.si/build';

server.use('/static/html', express.static(file_prefix + '/html'));
server.use('/static/js', express.static(file_prefix + '/js'));

server.get('/status/current_question_id', function(req, res) {
    res.send("Current question: " + current_question_id);
});


server.get('/data/question/current', function(req, res) {
    console.log("Requested current question = " + current_question_id);
    get_question(current_question_id, (err, doc) => {
      console.log("Doc type:")
      console.log(doc.constructor.name);
      res.send(doc);
    });
});

server.get('/data/question/:question_id', function(req, res) {
    console.log('Requested question: ' + req.params.question_id);
    var id = parseInt(req.params.question_id);
    get_question(id, (err, doc) => {
      res.send(doc);
    });
});

server.get('/data/questions', function(req, res) {
  var collection = db.collection('questions');
  collection.find({}).toArray((err, docs) => {
    assert.equal(err, null);
    res.send(docs)
  });
});



var server_port = 3000;

server.listen(server_port, function () {
  console.log('Nomad.si listening on port ' + server_port + '.');
});

function get_question(id, callback) {
    var collection = db.collection('questions');
    var question = collection.findOne({_id: id}, {}, callback);
}
