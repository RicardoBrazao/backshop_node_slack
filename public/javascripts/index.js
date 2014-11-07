window.onload = function(){

  $('#user_list').click(function(){
    $.ajax({
      url: '/users',
      dataType: 'html'
    }).done(function(response){
      $("#information_list").html(response);
    })
  });

  $('#history_list').click(function(){
    $.ajax({
      url: '/message_for_users',
      dataType: 'html'
    }).done(function(response){
      $("#information_list").html(response);
    })
  });

  $("#refresh_total_messages").click(function(){
    $.post('/refresh_total_messages',
            function(response){
              alert("Refresh done");
            }
    );
  });




}