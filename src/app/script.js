const MESSAGE_ENUM = Object.freeze({
  SELF_CONNECTED: "SELF_CONNECTED",
  CLIENT_CONNECTED: "CLIENT_CONNECTED",
  CLIENT_DISCONNECTED: "CLIENT_DISCONNECTED",
  CLIENT_MESSAGE: "CLIENT_MESSAGE"
})

// DOM references
let DOM_EL = {
  username: null,
  chatLog: null,
  chatInput: null,
  chatInputButton: null
}

let wsTimeout = null;

window.addEventListener('DOMContentLoaded', event => {
  assignReferences();
  attachListeners();
});

ws = new WebSocket("wss://your-domain/ws");
ws.onopen = evt => {
  wsTimeout = setTimeout(ping, 50000);

  ws.onmessage = evt => {
    let msg = JSON.parse(evt.data);
    switch (msg.type) {
      case MESSAGE_ENUM.CLIENT_MESSAGE:
        printMessage(msg);
        console.log(`${msg.sender} says: ${msg.body}`);
        break;
      case MESSAGE_ENUM.CLIENT_CONNECTED:
        logMessage(msg);
        console.log(`${msg.body.name} has joined the chat.`);
        break;
      case MESSAGE_ENUM.CLIENT_DISCONNECTED:
        logMessage(msg);
        console.log(`${msg.body.name} has left the chat.`);
        break;
      case MESSAGE_ENUM.SELF_CONNECTED:
        DOM_EL.username.innerText = `Your username is: ${msg.body.name}`
        break;
      default:
        console.log("Unknown message type.");
    }
  }
}

const sendMessage = evt => {
  let msg = {
    type: MESSAGE_ENUM.CLIENT_MESSAGE,
    body: DOM_EL.chatInput.value
  }
  ws.send(JSON.stringify(msg));
  DOM_EL.chatInput.value = "";
}

const printMessage = msg => {
  let listEl = document.createElement('li');
  let usernameSpanEl = document.createElement('span');
  let textSpanEl = document.createElement('span');

  usernameSpanEl.classList.add('username');
  usernameSpanEl.innerText = msg.sender;
  textSpanEl.classList.add('text');
  textSpanEl.innerText = msg.body;

  listEl.appendChild(usernameSpanEl);
  listEl.appendChild(textSpanEl);

  DOM_EL.chatLog.appendChild(listEl);
}

const logMessage = msg => {
  let listEl = document.createElement('li');
  let usernameSpanEl = document.createElement('span');
  let textSpanEl = document.createElement('span');

  usernameSpanEl.classList.add('username');
  usernameSpanEl.innerText = "System";
  textSpanEl.classList.add('text');

  switch(msg.message_type) {
    case MESSAGE_ENUM.CLIENT_CONNECTED:
      textSpanEl.innerText = `${msg.body.name} has connected`;
      break;
    case MESSAGE_ENUM.CLIENT_DISCONNECTED:
      textSpanEl.innerText = `${msg.body.name} has disconnected`;
      break;
    default:
      console.error("Unknown message type");
  }

  listEl.appendChild(usernameSpanEl);
  listEl.appendChild(textSpanEl);

  DOM_EL.chatLog.appendChild(listEl);
}

function assignReferences() {
  DOM_EL.username = document.getElementById("username");
  DOM_EL.chatLog = document.getElementById("chat-log");
  DOM_EL.chatInput = document.getElementById("chat-input");
  DOM_EL.chatInputButton = document.getElementById("chat-input-button");
}

function attachListeners() {
  DOM_EL.chatInputButton.addEventListener('click', sendMessage);
  DOM_EL.chatInput.addEventListener('keydown', handleKeyDown);
}

function handleKeyDown(evt) {
  evt.key === 'Enter' && 
  DOM_EL.chatInput.value !== '' &&
  DOM_EL.chatInput.value.trim() !== '' ? sendMessage() : '';
}