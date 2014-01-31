$(function() {
  var socket = io.connect('http://192.168.24.85:3000');

  var sethp = function(data, chara) {
    if (!chara) {
      chara = $('.chara[data-sid='+data.id+']');
    }
    var baseWidth = chara.find('.hp').width();
    chara.find('.hp > .remain').css({
      width: data.hp / data.maxhp * baseWidth
    });
  };

  socket.on('set chara', function (data) {
    if (!$('.chara[data-sid='+data.id+']').size()) {
      var chara = $('#chara').clone().removeAttr('id').attr('data-sid',data.id).offset({
        top: data.point.y,
        left: data.point.x
      });
      $('#field').append(chara);
      chara.find('.range').css({
        width: data.range*2
        , height: data.range*2
        , top: -data.range
        , left: -data.range
        , 'border-radius': data.range
      });
      sethp(data, chara);
    }
  });

  $('#field').on('click', function(e) {
    var fp = $(this).position();
    socket.emit('field tap', { x: e.pageX - fp.left, y: e.pageY - fp.top });
  });

  socket.on('anyone move', function (data) {
    var my = $('.chara[data-sid='+data.id+']');
    my.animate({
      top: data.point.y,
      left: data.point.x
    }, 1000, "linear");
  });

  socket.on('anyone attack', function (data) {
    sethp(data);
  });

  socket.on('die', function (data) {
    $('.chara[data-sid='+data.id+']').remove();
  });


});

