 
var MongoClient = require('mongodb').MongoClient
var assert = require('assert');
var express = require('express');
var body_parser = require('body-parser');

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
      if (doc != null) {
        console.log("Doc type:")
        console.log(doc.constructor.name);
        res.send(doc);
      }
      else { res.sendStatus(404); }
    });
});

server.get('/data/question/:question_id', function(req, res) {
    console.log('Requested question: ' + req.params.question_id);
    var id = parseInt(req.params.question_id);
    get_question(id, (err, doc) => {
      if (doc != null) { res.send(doc); }
      else { res.sendStatus(404); }
    });
});

server.get('/data/questions', function(req, res) {
  var collection = db.collection('questions');
  collection.find({}).toArray((err, docs) => {
    if (doc != null) { res.send(docs); }
    else { res.sendStatus(404); }
  });
});

server.post('/data/answer', body_parser.json(), (req, res) => {
  var data = req.body;
  console.log("Received answer:");
  console.log(data);
  //var collection = db.collection('answers');
  res.sendStatus(200);
});

var server_port = 3000;

server.listen(server_port, function () {
  console.log('Nomad.si listening on port ' + server_port + '.');
});

function get_question(id, callback) {
    var collection = db.collection('questions');
    var question = collection.findOne({_id: id}, {}, callback);
}
