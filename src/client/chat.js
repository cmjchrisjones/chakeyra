

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
  console.log(clientId, authToken);
  console.dir(user);
  console.dir(userId);
  console.log(`Player joined: Welcome ${user}`);

  var profilePicture = getUserProfilePic(userId, clientId, authToken)
    .then(res => {
      console.log(res);
      var playerList = document.getElementById('playerList');

      var img = document.createElement('img');
      img.src = res;
      img.className = 'playerImage';
      // var userItem = document.createElement('span');
      playerList.appendChild(img);
    });
});

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
          return profileUrl;
        }
      }
    })
    .catch(err => console.error(err))
}



function startGameForChat() {
  socket.emit('startgame');
}
