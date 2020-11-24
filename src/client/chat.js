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

socket.on('updatedUsers', (userList) => {
  console.log("Received updated player list");
  console.table(userList);
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




function startGameForChat() {
  socket.emit('startgame');
}
