const ComfyJS = require('comfy.js');
const { emit } = require('./server');
const axios = require('axios');

let gameStarted = false;
let serverSocket;
let players = [];

// regular expression to capture first word from chat message from viewer
// regex provided by @NickAndMartinLearnStuff
// const reee = /^[\w\-,\']+$/;
const reee = /^[^\s\.\?!]+$/;

module.exports = {
  connect,
  startGame,
  endGame,
  getUserProfilePic,
  players
};

class UserData {
  constructor(userId, displayName, profileImageUrl) {
    this.userId = userId;
    this.displayName = displayName;
    this.profileImageUrl = profileImageUrl;
  }
}

let users = new Array();

function getUserProfilePic(userId) {
  return axios({
    method: "get",
    url: `https://api.twitch.tv/helix/users?id=${userId}`,
    headers: {
      Authorization: `Bearer ${process.env.TWITCH_CHANNEL_AUTH_TOKEN}`,
      'Content-Type': 'application/json',
      'Client-ID': process.env.TWITCH_CLIENT_ID
    }
  })
    .then(res => {
      if (res.data) {
        const body = res.data;
        const userData = body.data.length > 1 ? body.data : body.data[0];
        if (userData) {
          let profileUrl = userData.profile_image_url;
          var profileImageUrl = profileUrl.replace('300x300', '70x70'); 
          return profileImageUrl;
        }
      }
    })
    .catch(err => console.error(err));
}


function connect(server) {
  serverSocket = server;
  ComfyJS.onChat = chatHandler;
  ComfyJS.onCommand = commandHandler;

  ComfyJS.Init('cmjchrisjones');
}

function startGame() {
  gameStarted = true;
}

function endGame() {
  gameStarted = false;
  players = [];
  users = [];
  serverSocket.emit('updatedUsers', users);
}

function chatHandler(user, message, flags, self, extra) {
  console.log(players.find(player => player === user));

  if (gameStarted) {
    // if (message.length === 1 && players.find(player => player === user)) {
    //   sendChatKey(message);
    // }
    if (reee.test(message) && players.find(player => player === user)) {
      sendChatKey(message);
    }
  }
}

function commandHandler(user, command, message, flags, extra) {
  if (command === 'join' && !players.find(player => player === user)) {
    players.push(user);
    serverSocket.emit('playerJoined', user, extra.userId);

    getUserProfilePic(extra.userId)
      .then(profileImage => {
        var u = new UserData(extra.userId, extra.displayName, profileImage)
        users.push(u)
        serverSocket.emit('updatedUsers', users, u);
      });
  }
}

function sendChatKey(message) {
  serverSocket.emit('chatkey', message);
}
