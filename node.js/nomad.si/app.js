 
var MongoClient = require('mongodb').MongoClient
var assert = require('assert');
var express = require('express');
var body_parser = require('body-parser');

// Globals
var file_prefix = '/home/jakob/code/nomad.si/build';
var server_port = 3000;
var db_url = 'mongodb://localhost:27017/nomad-si-test';

var current_state_id = 1;
var decision_enabled = false;

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

    console.log("Requested status. Current state id = " + current_state_id);

    Promise.all([
      get_state(state_id),
      get_answer_stats(state_id)
    ])
    .then(values => {
      data = { state: values[0], answers: values[1], decision_enabled: decision_enabled };
      res.send(data);
    })
    .catch(err => {
      console.log("Error getting data: " + err);
      res.sendStatus(503);
    });
});

server.post('/control/current_state', body_parser.json(), (req, res) => {
  var data = req.body;

  console.log("Got request for current state: " + data);

  if (data.state_id == undefined)
    res.status(400).send("Requested state id is undefined.");

  current_state_id = data.state_id;

  if (data.decision_enabled == true)
    decision_enabled = true;
  else
    decision_enabled = false;

  res.sendStatus(200);
});

server.get('/data/state/current', function(req, res) {

    if (!req.query) {
      res.status(400).send("Missing query.");
      return;
    }
    if (!req.query.user_id) {
      res.status(400).send("Missing query: user_id.");
      return;
    }

    var user_id = req.query.user_id;

    console.log("Requested current state:"
      + " state id = " + current_state_id
      + ", user id = " + user_id);

    Promise.all([
      get_state(current_state_id),
      get_answer(current_state_id, user_id)
    ])
    .then(values => {
      var data = {};
      data.state = values[0];
      data.decision_enabled = decision_enabled;
      if (values[1])
        data.selected_answer = values[1].answer;
      res.send(data);
    })
    .catch(err => {
      console.log("Error: " + err);
      res.sendStatus(400);
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

  if (!decision_enabled) {
    var msg = "Decision not enabled!";
    console.log(msg);
    res.status(404).send(msg);
  }

  if (data.state != current_state_id) {
    msg = "Answer does not match current state.";
    res.status(404).send(msg);
  }


  var collection = db.collection('answers');
  var query = { user: data.user, state: data.state };
  var insertion = { user: data.user, state: data.state, answer: data.answer };
  collection.update(query, insertion)
    .then(() => {
      res.sendStatus(200);
    })
    .catch(err => {
      console.log("Error storing answer:");
      console.log(err);
      res.status(503).send(err);
    });
});

function get_state(state_id) {
    var collection = db.collection('states');
    return collection.findOne({_id: state_id}, {});
}

function get_answer(state_id, user_id) {
  var collection = db.collection('answers');
  return collection.findOne({user: user_id, state: state_id});
  /*return collection.findOne({user: user_id, state: state_id}, {}, (err,doc) => {
    console.log("Doc: " + JSON.stringify(doc));
  });*/
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
              ++count;
              stats[id] = count;
          });
          return stats;
      });
}

server.listen(server_port, function () {
  console.log('Nomad.si listening on port ' + server_port + '.');
});
