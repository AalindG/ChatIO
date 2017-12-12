const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

let users = [];
let connections = [];

server.listen(process.env.PORT || 3000, ()=>{
   console.log('Server running...');
});



app.get('/', (req,res)=>{
   res.sendFile(__dirname +'/index.html')
});


io.sockets.on('connection', socket =>{
   connections.push(socket);
   console.log('Connected: %s sockets', connections.length);

   // Disconnect
   socket.on('disconnect', data => {
      // disconnect user
      users.splice(users.indexOf(socket.username), 1);
      updateUsers();
      // disconnect socket
      connections.splice(connections.indexOf(socket), 1);
      if(connections.length == 0){
         console.log('No Sockets connected!');
      }else{
         console.log('Disconnected! %s sockets still connected.', connections.length);
      }
   });

   // Send Message
   socket.on('send message', data => {
      // console.log(data);
      io.sockets.emit('new message', {msg: data, user: socket.username});
   });

   // Login event
   socket.on('new user', (data, callback)=>{
      callback(true);
      socket.username = data;
      users.push(socket.username);
      updateUsers();
   });

   // Get Users
   let updateUsers = ()=>{
      console.log('Users: ', users);
      io.sockets.emit('get users', users);
   }
})
