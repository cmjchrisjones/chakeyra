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
const AUTH_TOKEN = '';

function getTwitchAuthToken() {
  return axios({
    method: 'post',
    url: `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials&scope=user:read:email`
  })
    .then(res => {
      console.log(res.data);
      console.log(AUTH_TOKEN)
      return AUTH_TOKEN;
    })
    .then(_ => {
      console.log(AUTH_TOKEN);
      return AUTH_TOKEN;
    })
}


function getUserProfilePic(userId) {
  let bearerToken = '';
  if (bearerToken = '') {
    bearerToken = getTwitchAuthToken();
  }

  console.log("bearer token: " + bearerToken);
  return axios({
    method: "get",
    url: `https://api.twitch.tv/helix/users?id=${userId}`,
    headers: {
      Authorization: `Bearer ${bearerToken}`,
      'Content-Type': 'application/json',
      'Client-ID': process.env.TWITCH_CLIENT_ID
    }
  })
    .then(res => {
      if (res.data) {
        console.log(res.data);
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

  ComfyJS.Init(process.env.TWITCH_CHANNEL_ID);
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
