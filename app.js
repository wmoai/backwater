var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , async = require('async')
  , io = require('socket.io').listen(server)
;

app.use(express.static(__dirname + '/public'));

server.listen(3000);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

var Chara = function(socket) {
  this.socket = socket;
  this.point = {
    x : 10,
    y : 10
  };
  this.moving = false;
  this.v = 50;

  this.put = function() {
    console.log(socket.id);
    io.sockets.emit('set you', {point: this.point, id:socket.id});
  }

  this.move = function() {
    if (this.moving) {
      var dx = this.next.x - this.point.x;
      var dy = this.next.y - this.point.y;
      var h = Math.sqrt(Math.pow(dx,2) + Math.pow(dy,2));
      if (this.v >= h) {
        this.point = this.next;
        this.moving = false;
      } else {
        var r = this.v / h;
        var nx = Math.round(dx * r + this.point.x);
        var ny = Math.round(dy * r + this.point.y);
        this.point.x = nx;
        this.point.y = ny;
      }
      io.sockets.emit('move you', {point: this.point, id:this.socket.id});
    }
  };
  var timer;
  this.run = function() {
    var self = this;
    timer = setInterval(function(){
      self.move();
    }, 1000);
  };
  this.die = function() {
    clearInterval(timer);
    this.socket.emit('die', {id:this.socket.id});
    this.socket.broadcast.emit('die', {id:this.socket.id});
  }
}

var charas = new Array();

io.sockets.on('connection', function (socket) {
  var chara = new Chara(socket);
  charas[socket.id] = chara;
  for (var c in charas) {
    charas[c].put();
  };
  socket.on('field tap', function (data) {
    chara.next = data;
    chara.moving = true;
  });
  chara.run();

  socket.on('disconnect', function() {
    console.log('disconnect');
    charas[socket.id].die();
    delete charas[socket.id];
  });
});

