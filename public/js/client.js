/*jshint esversion: 6 */
//required for front end communication between client and server

const socket = io();

const inboxPeople = document.querySelector(".inbox__people");

let userName = "";
let id;
const newUserConnected = function () {

    //give the user a random unique id
    id = Math.floor(Math.random() * 1000000);
    userName = 'user-' +id; 
    

    //emit an event with the user id
    socket.emit("new user", userName);
    //call
    addToUsersBox(userName);
};

const addToUsersBox = function (userName) {
    //This if statement checks whether an element of the user-userlist
    //exists and then inverts the result of the expression in the condition
    //to true, while also casting from an object to boolean
    if (!!document.querySelector(`.${userName}-userlist`)) {
        return;
    
    }
  set_status(userName, status);
};

const set_status = function (userName) {
  let status_active = `<img class = "active-status" id = "active-status-${userName}" src="https://mirandaregion-alarmnova.codio-box.uk/user%20(1).png" alt="Active">`;
  let status_typing = `<img class = "typing-status" id = "typing-status-${userName}" src="https://mirandaregion-alarmnova.codio-box.uk/typing%20(1).png" alt="Typing">`;

  //setup the divs for displaying the connected users
    //id is set to a string including the username
  const userBox = `
  <div class="chat_id ${userName}-userlist">
    <p>${userName}:</p><p>${status_active}</p><p>${status_typing}</p>
  </div>`;
  //set the inboxPeople div with the value of userbox
  inboxPeople.innerHTML += userBox;
};

//call 
newUserConnected();


//when a new user event is detected
socket.on("new user", function (data) {
  //https://stackoverflow.com/questions/3216013/get-the-last-item-in-an-array
  //kritzikratzi
  newuser_msg(data.slice(-1)[0]);
  data.map(function (user) {
          return addToUsersBox(user, status);
      });
});

const newuser_msg = function (user) {
  addNewMessage({ user: "System", message: `${user} --- Connected` });
};

//when a user leaves
socket.on("user disconnected", function (userName) {
  document.querySelector(`.${userName}-userlist`).remove();
  addNewMessage({ user: "System", message: `${userName} --- Disonnected` });
});


const inputField = document.querySelector(".message_form__input");
const messageForm = document.querySelector(".message_form");
const messageBox = document.querySelector(".messages__history");

const addNewMessage = ({ user, message }) => {
  const isScrolledToBottom = messageBox.scrollHeight - messageBox.clientHeight <= messageBox.scrollTop + 1;
  const time = new Date();
  const formattedTime = time.toLocaleString("en-US", { hour: "numeric", minute: "numeric" });

  
  const receivedMsg = `
  <div class = "Msg">
    <div class="incoming__message">
      <div class="received__message">
        <p>${message}</p>
        <div class="message__info">
          <span class="message__author">${user}</span> <span class="time_date">${formattedTime}</span>
        </div>
      </div>
    </div>
  </div>`;

  const myMsg = `
  <div class = "Msg">
    <div class="outgoing__message">
      <div class="sent__message">
        <p>${message}</p>
        <div class="message__info">
          <span class="user_sent">${user}</span> <span class="time_date">${formattedTime}</span>
        </div>
      </div>
    </div>
  </div>`;

  const SystemMsg = `
  <div class = "Msg">
    <div class="structure__message">
      <div class="system__message">
        <p>${message}</p>
        <div class="message__info">
          <span class="user_sent">${user}</span> <span class="time_date">${formattedTime}</span>
        </div>
      </div>
    </div>
  </div>`;

  
  //is the message sent or received
  if (user === userName) {
    messageBox.innerHTML += myMsg;
} else if (user === "System") {
    messageBox.innerHTML += SystemMsg;
} else {
    messageBox.innerHTML += receivedMsg;
}
  
    // scroll to bottom if isScrolledToBottom is true
  if (isScrolledToBottom) messageBox.scrollTop = messageBox.scrollHeight - messageBox.clientHeight;
  
  //https://stackoverflow.com/questions/18614301/keep-overflow-div-scrolled-to-bottom-unless-user-scrolls-up
  //const isScrolledToBottom = out.scrollHeight - out.clientHeight <= out.scrollTop + 1
  //const newElement = document.createElement("div")
  //if (isScrolledToBottom) {
    //out.scrollTop = out.scrollHeight - out.clientHeight

  //Code by: dotnetCarpenter
};

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!inputField.value) {
    return;
  }

  socket.emit("chat message", {
    message: inputField.value,
    nick: userName,
  });

  inputField.value = "";
});

socket.on("chat message", function (data) {
  addNewMessage({ user: data.nick, message: data.message });
  active_status();
});

//https://stackoverflow.com/questions/5801543/javascript-setinterval
//Delan Azabani
let time_since_last_press = 0;
setInterval(() => {
    time_since_last_press += 500;
}, 500);

socket.on("is typing", function (user) {
  typing_status(user);
});

const typing = function(){
  socket.emit("is typing", userName);
};

socket.on("stop typing", function (user) {
  active_status(user);
});

const stop_typing = function(){
  socket.emit("stop typing", userName);
};

const typing_status = function(user) {

  const type_display_val = document.getElementById(`typing-status-${user}`);
  const active_display_val = document.getElementById(`active-status-${user}`);

  type_display_val.style.display = 'block';
  active_display_val.style.display = 'none';

  time_since_last_press = 0;
  setTimeout(stop_typing, 2000, user);
};

const active_status = function(user) {
  if (time_since_last_press < 2000) return;

    const type_display_val = document.getElementById(`typing-status-${user}`);
    const active_display_val = document.getElementById(`active-status-${user}`);

    type_display_val.style.display = 'none';
    active_display_val.style.display = 'block';
};

