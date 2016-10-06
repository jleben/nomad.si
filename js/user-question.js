
user_id = sessionStorage.getItem('user_id');
if (!user_id)
  window.location = '/static/html/user-login.html'

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
      state_id = data.state._id;
      console.log("State = " + state_id);
      console.log("Selected answer = " + data.selected_answer);
      var content = userQuestionContentTemplate(data);
      var container = document.getElementById('content');
      container.innerHTML = content;
  };

  http.open("GET", "/data/state/current?user_id="+user_id, true);
  http.send();
}

function submitAnswer() {
  selection = document.querySelector('input[name="answer"]:checked');
  if (selection == null)
  {
    console.log("No selection.");
    return;
  }

  console.log("State = " + state_id);

  var answer = { user: user_id, state: state_id, answer: selection.value };

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
