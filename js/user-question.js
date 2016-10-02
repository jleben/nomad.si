 
window.onload = function() {
  loadQuestion()
};

function loadQuestion() {

  var http = new XMLHttpRequest();

  http.onreadystatechange = function() {
      //console.log("Response status change.");
      if (http.readyState != 4) {
          return;
      }
      if (http.status != 200) {
          //console.log("Response error.");
          return;
      }

      //console.log("Response complete.");

      var data = JSON.parse(http.response);

      //document.getElementById('question').textContent = data.text;
/*
      console.log("Response data:");
      console.log("Type: " + http.responseType);
      console.log(data.constructor.name);
      console.log(data);
*/
      var content = userQuestionContentTemplate({question: data});

      var container = document.getElementById('content');
      container.innerHTML = content;

      /*
      data.answers.forEach(answer => {
        var container = document.getElementById('answers');
        var option = document.createElement('input');
        option.type = "radio";
        option.name = "answer";
        option.value = answer._id;
        option.textContent = answer.text;
        container.appendChild(option);
      });
      */
  };

  http.open("GET", "/data/question/current", true);
  http.send();
}

