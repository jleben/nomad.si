 
window.onload = function() {
  update();
};

var current_state_id = undefined;

function update()
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

      display(data);
  };
  http.open('GET', '/status', true);
  http.send();
}

function display(status) {
  console.log("Displaying: " + status);
  var content = controlContentTemplate({ status: status });
  var container = document.getElementById('content');
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

  update();
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
        update();
      } else {
        var status = document.getElementById('status');
        status.textContent = "An error occurred: " + http.status;
      }
  };

  http.open('POST', '/control/current_state', true);
  http.setRequestHeader("Content-Type", "application/json");
  http.send(JSON.stringify(data));
}
