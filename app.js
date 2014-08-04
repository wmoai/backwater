// hoi
// hello
// ok
var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , async = require('async')
  , io = require('socket.io').listen(server)
;

app.use(express.static(__dirname + '/public'));

server.listen(3030);

var sec = 1;
app.get('/', function (req, res) {
  if (req.query.sec) {
    sec = req.query.sec;
  }
  res.sendfile(__dirname + '/index.html');
});

var charas = new Array();

var Chara = function(socket) {
  this.socket = socket;
  this.point = {
    x : 10,
    y : 10
  };
  this.moving = false;
  this.v = 100;
  this.range = 100 * sec;
  this.hp = 200;
  this.maxhp = 200;
  this.str = 10;

  this.put = function() {
    console.log(socket.id);
    io.sockets.emit('set chara', {
      id:socket.id
      , point: this.point
      , maxhp: this.maxhp
      , hp: this.hp
      , range: this.range
    });
  }

  this.move = function() {
    if (this.moving) {
      var dx = this.next.x - this.point.x;
      var dy = this.next.y - this.point.y;
      var theta = Math.atan2(dy, dx);
      var h = dy;
      if (dx != 0) {
        h = dx / Math.cos(theta);
      }
      if (this.v >= h) {
        this.point = this.next;
        this.moving = false;
      } else {
        this.point.x += Math.round(Math.cos(theta) * this.v);
        this.point.y += Math.round(Math.sin(theta) * this.v);
      }
      io.sockets.emit('anyone move', {
        id: this.socket.id
      , point: this.point
      });

    }
  };
  this.attack = function() {
    var self = this;
    charas.forEach(function(c) {
      if (self != c) {
        var dx = self.point.x - c.point.x;
        var dy = self.point.y - c.point.y;
        var h = dy;
        if (dx != 0) {
          var theta = Math.atan2(dy, dx);
          h = dx / Math.cos(theta);
        }
        if (self.range >= h) {
          console.log("atack from %s to %s", self.socket.id, c.socket.id);
          c.hp -= self.str;
          io.sockets.emit('anyone attack', {
            id: c.socket.id
            , maxhp: c.maxhp
            , hp: c.hp
            , from: self.socket.id
          });
        }
      }
    });
  };
  var timer;
  this.run = function() {
    var self = this;
    timer = setInterval(function(){
      self.move();
      self.attack();
      if (self.hp <= 0) {
        self.die();
      }
    }, 1000);
  };
  this.die = function() {
    clearInterval(timer);
    this.socket.emit('die', {id:this.socket.id});
    this.socket.broadcast.emit('die', {id:this.socket.id});
    for (var i=0; i<charas.length; i++) {
      if (this == charas[i]) {
        charas.splice(i, 1);
      }
    }
  }
}

io.sockets.on('connection', function (socket) {
  var chara = new Chara(socket);
  charas.push(chara);
  charas.forEach(function(c) {
    c.put();
  });
  socket.on('field tap', function (data) {
    chara.next = data;
    chara.moving = true;
  });
  chara.run();

  socket.on('disconnect', function() {
    console.log('disconnect');
    for (var i=0; i<charas.length; i++) {
      if (chara == charas[i]) {
        charas[i].die();
      }
    }
  });
});

