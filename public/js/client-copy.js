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
  //Obtaining new user and outputting a connection message
  newuser_msg(data.slice(-1)[0]);
  data.map(function (user) {
          return addToUsersBox(user);
      });
});

//Calls addnewmessage function on new user instance
const newuser_msg = function (user) {
  addNewMessage({ user: "System", message: `${user} --- Connected` });
};

//when a user leaves
socket.on("user disconnected", function (userName) {
  document.querySelector(`.${userName}-userlist`).remove();
  // calls addnewmessage function on user disconnect
  addNewMessage({ user: "System", message: `${userName} --- Disonnected` });
});


const inputField = document.querySelector(".message_form__input");
const messageForm = document.querySelector(".message_form");
const messageBox = document.querySelector(".messages__history");

const addNewMessage = ({ user, message }) => {
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

  //When msg occours from no user (i.e joining)
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
  
  //is the message sent or received or System (this mattters because of message colouration)
  if (user === userName) {
    messageBox.innerHTML += myMsg
    setInterval();
} else if (user === "System") {
    messageBox.innerHTML += SystemMsg
    setInterval();
} else {
    messageBox.innerHTML += receivedMsg
    setInterval();
}
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