//required for front end communication between client and server

const socket = io();

const inboxPeople = document.querySelector(".inbox__people");


let userName = "";
let id;
const newUserConnected = function (data) {

    //give the user a random unique id
    id = Math.floor(Math.random() * 1000000);
    userName = 'user-' +id;
    //console.log(typeof(userName));   
    

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
    
    //setup the divs for displaying the connected users
    //id is set to a string including the username
    const userBox = `
    <div class="chat_id ${userName}-userlist">
      <h5>${userName}</h5>
    </div>
  `;
    //set the inboxPeople div with the value of userbox
    inboxPeople.innerHTML += userBox;
};

//call 
newUserConnected();


//when a new user event is detected
socket.on("new user", function (data) {
  //https://stackoverflow.com/questions/3216013/get-the-last-item-in-an-array
  newuser_msg(data.slice(-1)[0]);
  data.map(function (user) {
          return addToUsersBox(user);
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
  const isScrolledToBottom = messageBox.scrollHeight - messageBox.clientHeight <= messageBox.scrollTop + 1
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
    messageBox.innerHTML += myMsg
} else if (user === "System") {
    messageBox.innerHTML += SystemMsg
} else {
    messageBox.innerHTML += receivedMsg
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
});

