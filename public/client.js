$(function() {
  var socket = io.connect('http://localhost');
  socket.on('set you', function (data) {
    if (!$('.chara[data-sid='+data.id+']').size()) {
      var chara = $('<div>').addClass('chara').attr('data-sid',data.id).offset({
        top: data.point.y,
        left: data.point.x
      });
      $('#field').append(chara);
    }
  });

  $('#field').on('click', function(e) {
    var fp = $(this).position();
    socket.emit('field tap', { x: e.clientX - fp.left, y: e.clientY - fp.top });
  });

  socket.on('move you', function (data) {
    $('.chara[data-sid='+data.id+']').animate({
      top: data.point.y,
      left: data.point.x
    }, 1000, "linear");
  });

  socket.on('die', function (data) {
    $('.chara[data-sid='+data.id+']').remove();
  });


});

