const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

app.use(cors());
const server = http.createServer(app)

const io = new Server(server,{
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET","POST"],
    },
});

const rooms = {};
let room_opening = 0;

io.on("connection", (socket) =>{
    console.log(`User Connected: ${socket.id}`)
    socket.on("join_room", () => {
        if (rooms[room_opening] && rooms[room_opening].length === 1)
        {
            rooms[room_opening].push(socket.id);
            socket.join(room_opening);
            const data = {color: "black", room:room_opening};
            socket.emit("receive_room_color", data);
            console.log(`Join old room: ${room_opening}`);
        }
        else
        {
            let room_available = 1;
            let found_room = false;
            //function to find a place for a new room
            while (found_room === false)
                {
                    if (!rooms[room_available])
                    {
                        rooms[room_available] = [];
                        rooms[room_available].push(socket.id);
                        socket.join(room_available);
                        const data = {color: "white", room:room_available};
                        socket.emit("receive_room_color", data);
                        room_opening = room_available;
                        found_room = true;
                    }
                    room_available++;
                }
            console.log(`Create new room: ${room_opening}`);
        }
    })

    socket.on("disconnecting" ,()=>
    {
        const roomToLeave = Array.from(socket.rooms).filter(room => room !== socket.id);
        if (roomToLeave in rooms) {
            delete rooms[roomToLeave];
            console.log(rooms);
            }
        console.log(`Disconnecting from rooms: ${roomToLeave}`);
    });

    socket.on("send_switch", (data) => {
        io.in(data.room).emit("receive_switch", data)
    });

    socket.on("send_start_game", (data) => {
        io.in(data.room).emit("receive_start_game");
    });
})

server.listen(3001, ()=> {
    console.log("SERVER IS RUNNING");
});


