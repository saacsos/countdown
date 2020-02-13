var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var countdown = 0;
var isStart = false;
var interval = null;
var port = 80;

server.listen(port, '0.0.0.0');

app.use(express.static('public'));

console.log("listen on port " + port);
console.log("for admin /countdown/admin/setting");
console.log("for client: /");

app.get('/home', function(request, response) {
	response.sendFile(__dirname + '/index.html');
});

app.get('/', function(request, response) {
	response.sendFile(__dirname + '/countdown.html');
});

app.get('/countdown/admin/setting', function(request, response) {
	response.sendFile(__dirname + '/countdown-admin-setting.html');
});

io.on('connection', function(socket) {
	console.log('connection was establish');
	socket.on('chat.message', function(message) {
		console.log('to server: ' + message);
		io.emit('chat.message', message);
	});

	socket.on('time.fetch', function () {
		console.log('request time.fetch');
		io.emit('time.left', countdown, isStart);
	});

	socket.on('time.set', function (minute) {
		console.log('request time.set ' + minute);
		countdown = minute;
		io.emit('time.left', countdown)
	});

	socket.on('time.start', function () {
		console.log('request time.start')
		if (!isStart) {
			io.emit('time.start');
			isStart = true;
			interval = setInterval(function () {
				if (isStart && countdown > 0) {
					countdown -= 1;
					console.log('loop countdown left: ' + countdown);
				} else {
					clearInterval(this);
					console.log('clear interval');
				}
			}, 1000);
		}
	});

	socket.on('time.reset', function () {
		console.log('request time.reset ');
		countdown = 0;
		isStart = false;
		clearInterval(interval);
		console.log('clear interval');
		io.emit('time.reset')
	});

	socket.on('time.pause', function () {
		console.log('request time.pause ');
		if (interval) {
			isStart = false;
		}
		io.emit('time.pause')
	});

	socket.on('time.resume', function () {
		console.log('request time.resume ');
		if (interval) {
			isStart = true;
		}
		io.emit('time.resume')
	});

	socket.on('message.notice', function (message) {
		console.log('request message.notice ' + message);
		io.emit('message.notice', message)
	});

	socket.on('message.header', function (message) {
		console.log('request message.header ' + message);
		io.emit('message.header', message)
	});

	socket.on('message.alert', function (message) {
		console.log('request message.alert ' + message);
		io.emit('message.alert', message)
	});

	
});
