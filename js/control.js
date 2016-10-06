 
window.onload = function() {
  updateStatus();
  loadStateList();
};

var current_state_id = undefined;

function updateStatus()
{
  var http = new XMLHttpRequest();
  http.onreadystatechange = function() {
      if (http.readyState != 4) {
          return;
      }
      if (http.status != 200) {
          return;
      }

      var data = JSON.parse(http.response);

      current_state_id = data.state._id;

      displayStatus(data);
  };
  http.open('GET', '/status', true);
  http.send();
}

function displayStatus(status) {
  console.log("Displaying: " + status);
  var content = controlContentTemplate({ status: status });
  var container = document.getElementById('content');
  container.innerHTML = content;
}

function loadStateList() {
  var http = new XMLHttpRequest();
  http.onreadystatechange = function() {
      if (http.readyState != 4) return;
      if (http.status != 200) return;
      var states = JSON.parse(http.response);
      displayStateList(states);
  };
  http.open('GET', '/data/states', true);
  http.send();
}

function displayStateList(states) {
  var content = controlStateListTemplate({ states: states });
  var container = document.getElementById('state_list');
  container.innerHTML = content;
}

function setDecisionEnabled(enabled) {
  if (!current_state_id)
    return;

  data = { state_id: current_state_id, decision_enabled: enabled };

  var http = new XMLHttpRequest();
  http.open('POST', '/control/current_state', true);
  http.setRequestHeader("Content-Type", "application/json");
  http.send(JSON.stringify(data));

  updateStatus();
}

function goToState(id) {
  console.log("Requesting new state: " + id);

  var data = { state_id: id }

  var http = new XMLHttpRequest();

  http.onreadystatechange = function() {
      if (http.readyState != 4) {
          return;
      }
      if (http.status == 200) {
        updateStatus();
      } else {
        var status = document.getElementById('status');
        status.textContent = "An error occurred: " + http.status;
      }
  };

  http.open('POST', '/control/current_state', true);
  http.setRequestHeader("Content-Type", "application/json");
  http.send(JSON.stringify(data));
}
