
function submit_id()
{
  id = document.getElementById('id_input').value;
  if (!id)
    return;
  sessionStorage.setItem('user_id', id);
  window.location = "/static/html/user-question.html";
}
