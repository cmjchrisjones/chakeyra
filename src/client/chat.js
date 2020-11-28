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
  socket.emit("getUserData(userId)");
});

socket.on('updatedUsers', (userList, newUser) => {
  var playerList = document.getElementById('playerList');
  if (userList.length > 0 && newUser !== undefined) {
    var profileImageContainer = document.createElement('div');
    profileImageContainer.className = 'profileImageContainer';


    var nameTag = document.createElement('span');
    nameTag.className = 'nameTag';
    nameTag.innerText = newUser.displayName;

    var img = document.createElement('img');
    img.className = 'playerImage';
    img.src = newUser.profileImageUrl;
    img.alt = newUser.displayName
    img.title = newUser.displayName
    profileImageContainer.appendChild(img);
    profileImageContainer.appendChild(nameTag);
    playerList.appendChild(profileImageContainer);
    }
  else if (userList.length === 0) {
    var elementsToDelete = playerList.getElementsByClassName('profileImageContainer');
    while (elementsToDelete[0]) {
      elementsToDelete[0].parentNode.removeChild(elementsToDelete[0]);
    }
  }
  updatePlayerCount(userList);
});

function updatePlayerCount(users) {
  let element = document.getElementById('playerCount');
  let text = document.createElement('span');
  text.id = 'playerCountInfo';
  if (users !== undefined) {
    switch (users.length) {
      case 0:
        text.innerHTML = "No chat players";
        break;
      case 1:
        text.innerHTML = "1 player"
        break;
      default:
        text.innerHTML = `${users.length} players`;
    }
  } else {
    text.innerHTML = "No chat players";
  }

  element.textContent = '';
  element.appendChild(text);

}

function startGameForChat() {
  socket.emit('startgame');
}