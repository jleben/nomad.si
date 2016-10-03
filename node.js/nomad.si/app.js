 
var MongoClient = require('mongodb').MongoClient
var assert = require('assert');
var express = require('express');
var body_parser = require('body-parser');

// Globals
var file_prefix = '/home/jakob/code/nomad.si/build';
var server_port = 3000;
var db_url = 'mongodb://localhost:27017/nomad-si-test';
var current_state_id = 1;

// Database

var db;

// Use connect method to connect to the server
MongoClient.connect(db_url, function(err, connected_db) {
  assert.equal(null, err);
  console.log("Connected successfully to database.");
  db = connected_db;
});

// Server

var server = express();

server.use('/static/html', express.static(file_prefix + '/html'));
server.use('/static/js', express.static(file_prefix + '/js'));

server.get('/status/current_state_id', function(req, res) {
    res.send("Current state: " + current_state_id);
});

server.get('/status', function(req, res) {

    var state_id = current_state_id;

    var data = {};

    get_state(state_id)
      .then(state => {
          data.state = state;
      }, reason => {
          res.send("Can't get state: " + reason);
      })
      .then(() => {
          console.log("Getting answer stats.");
          return get_answer_stats(state_id)
      })
      .then(answer_stats => {
          console.log("Sending status.");
          data.answers = answer_stats;

          console.log("Status:");
          console.log(data);

          res.send(data);
      }, reason => {
          res.sendStatus(503);
      });
});

server.post('/control/current_state', body_parser.json(), (req, res) => {
  id = req.body.id;
  current_state_id = id;
});

server.get('/data/state/current', function(req, res) {
    console.log("Requested current state = " + current_state_id);
    get_state(current_state_id).then(doc => {
        console.log("Doc type:")
        console.log(doc.constructor.name);
        res.send(doc);
    }, err => {
      res.sendStatus(404);
    });
});

server.get('/data/state/:state_id', function(req, res) {
    console.log('Requested state: ' + req.params.state_id);
    var id = parseInt(req.params.state_id);
    get_state(id)
      .then(doc => { res.send(doc); },
            err => { res.sendStatus(404); });
});

server.get('/data/states', function(req, res) {
  var collection = db.collection('states');
  collection.find({}).toArray()
  .then(docs  => { res.send(docs); },
        error => { res.sendStatus(404); });
});

server.post('/data/answer', body_parser.json(), (req, res) => {
  var data = req.body;
  console.log("Received answer:");
  console.log(data);
  var collection = db.collection('answers');
  var dbData = { user: data.user, state: data.state, answer: data.answer };
  collection.insertOne(dbData, {}, (error, result) => {
    if (result != null) { res.sendStatus(200); }
    else { res.sendStatus(503); }
  });
});

function get_state(id) {
    var collection = db.collection('states');
    return collection.findOne({_id: id}, {});
}

function get_answer_stats(state_id) {
    var collection = db.collection('answers');
    return collection.find({state: state_id}).toArray()
      .then(answers => {
          var stats = {};
          answers.forEach((answer) => {
              var id = answer.answer;
              var count = stats[id];
              if (count == undefined)
                count = 0;
              else
                ++count;
              stats[id] = count;
          });
          return stats;
      }, reason => {
        return null;
      });
}

server.listen(server_port, function () {
  console.log('Nomad.si listening on port ' + server_port + '.');
});
