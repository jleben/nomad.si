 
window.onload = function() {
  update();
};

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
