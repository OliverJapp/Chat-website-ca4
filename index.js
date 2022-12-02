const express = require("express");
const socket = require("socket.io");

// App setup
const PORT = 5000;
const app = express();
const server = app.listen(PORT, function () {
  console.log(`Listening on port ${PORT}`);

});

// Static files
app.use(express.static("public"));

// Socket setup
const io = socket(server);

//we use a set to store users, sets objects are for unique values of any type
const activeUsers = new Set();

io.on("connection", function (socket) {
  console.log("Made socket connection");

  socket.on("new user", function (data) {
    socket.userId = data;
    activeUsers.add(data);
    //... is the the spread operator, adds to the set while retaining what was in there already
    io.emit("new user", [...activeUsers]);
  });
  //user disconnect function
  socket.on("disconnect", function () {
      activeUsers.delete(socket.userId);
      io.emit("user disconnected", socket.userId);
  });
  //chat message function
  socket.on("chat message", function (data) {
    io.emit("chat message", data);
  });
  // user typing function
  socket.on("is typing", (data) => {
    io.emit("is typing", data);
  });
  // user hasn't been typing for a while or has stopped
  socket.on("stop typing", (data) => {
    io.emit("stop typing", data);
  });
  // User hasn't been active for a while
  socket.on("idle", (data) => {
    io.emit("idle", data);
  });
  
});
