class UserData {
  constructor(userId, displayName, profileImageUrl) {
    this.userId = userId;
    this.displayName = displayName;
    this.profileImageUrl = profileImageUrl;
  }
}

let users = new Array();

socket.on('chatkey', (word) => {
  if (!isGameEnabled) {
    return;
  }

  if (chatFirstKey) {
    chatFirstKey = false;
    // start chat timer
    chatStartTime = Date.now();
  }

  const chatWordsElement = document.getElementById('chat-words');
  console.log(word);
  if (word === chatWords[0]) {
    //chatCompletedCharacters += chatCharacters[0];
    chatCompletedWords.push(chatWords[0]);
    // chatCharacters.shift();
    chatWords.shift();
    // chatWords = chatWords.substr(1);
    chatDone = chatWords.length === 0;

    const updatedChatWords = `<span class="correct">${chatCompletedWords.join(' ')}</span> ${!chatDone ? chatWords.join(' ') : ''}`;

    chatWordsElement.innerHTML = updatedChatWords;

    if (chatDone) {
      chatFirstKey = true;
      console.log(`Chat finished in ${(Date.now() - chatStartTime) / 1000} seconds`);
    }
  } else {
    if (!chatDone) {
      const updatedChatWords = `<span class="correct">${chatCompletedWords.join(' ')}</span> <span class="incorrect">${chatWords[0]}</span> ${chatWords.slice(1).join(' ')}`;
      chatWordsElement.innerHTML = updatedChatWords;
    }
  }
});

socket.on('playerJoined', async (user, userId, clientId, authToken) => {
  console.log(`Player joined: Welcome ${user}`);
  getUserProfilePic(userId, clientId, authToken)
    .then(res => {
      var playerList = document.getElementById('playerList');
      var img = document.createElement('img');
      img.className = 'playerImage';
      img.src = res;
      playerList.appendChild(img);
    });

});

function updatePlayerCount() {
  let element = document.getElementById('playerCount');
  let text = document.createElement('span');
  text.id = 'playerCountInfo';

  if (users.length === 1) {
    text.innerHTML = "1 player"
  }
  else {
    text.innerHTML = `${users.length} players`;
  }
  element.textContent = '';
  element.appendChild(text);
}

function getUserProfilePic(userId, clientId, authToken) {
  const config = {
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
      'Client-ID': clientId
    }
  };

  let url = `https://api.twitch.tv/helix/users?id=${userId}`;
  return axios({
    url: url,
    method: 'get',
    headers: config.headers
  })
    .then(res => {
      if (res.data) {
        const body = res.data;
        const userData = body.data.length > 1 ? body.data : body.data[0];
        if (userData) {
          let profileUrl = userData.profile_image_url;
          var user = new UserData(userId, userData.display_name, profileUrl);
          users.push(user);
          updatePlayerCount();
          return profileUrl.replace('300x300', '70x70');
        }
      }
    })
    .catch(err => console.error(err))
}



function startGameForChat() {
  socket.emit('startgame');
}
