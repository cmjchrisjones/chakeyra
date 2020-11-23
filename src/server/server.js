const express = require('express');
const path = require('path');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const chatCapture = require('./chat-capture');

const port = process.env.PORT || 3000;

app.use(express.static(path.resolve(`${__dirname}`, '../client')));

app.get('/', function (req, res) {
  res.render('/index');
});

io.on('connection', (socket) => {
  socket.on('startgame', () => {
    chatCapture.startGame();
  });
  socket.on('endgame', () => {
    chatCapture.endGame();
  });
});

const server = http.listen(port, function (error) {
  if (error) throw error;
  console.log(`The server is running: http://localhost:${port}`)
});
chatCapture.connect(io, process.env.TWITCH_CLIENT_ID, process.env.TWITCH_CLIENT_SECRET, process.env.TWITCH_CHANNEL_AUTH_TOKEN);

module.exports = server;
