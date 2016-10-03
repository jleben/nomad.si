
window.onload = function() {
  loadState()
};

var state_id = -1;

function loadState() {

  var http = new XMLHttpRequest();

  http.onreadystatechange = function() {
      if (http.readyState != 4) {
          return;
      }
      if (http.status != 200) {
          return;
      }
      var data = JSON.parse(http.response);
      state_id = data._id;
      var content = userQuestionContentTemplate({state: data});
      var container = document.getElementById('content');
      container.innerHTML = content;
  };

  http.open("GET", "/data/state/current", true);
  http.send();
}

function submitAnswer() {
  selection = document.querySelector('input[name="answer"]:checked');
  if (selection == null)
  {
    console.log("No selection.");
    return;
  }

  var answer = { user: 0, state: state_id, answer: selection.value };

  var http = new XMLHttpRequest();
  http.open("POST", "/data/answer", true);
  console.log("Sending: " + JSON.stringify(answer));
  http.setRequestHeader("Content-Type", "application/json");
  http.send(JSON.stringify(answer));
}

function onHttpSuccess(http, f) {
  if (http.readyState != 4) {
      return;
  }
  if (http.status != 200) {
      return;
  }
  f();
}
