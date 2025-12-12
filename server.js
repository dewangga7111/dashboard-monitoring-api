require("dotenv").config();
const http = require("http");
const app = require("./app");
const SocketIO = require('socket.io')
const SocketIoHelper = require('./src/helper/SocketIOHelper')

const httpServer = http.createServer(app);

const port = process.env.SERVER_PORT;
httpServer.listen(port, () => {
    console.log(`Server started, listening on port ${port}!`);

});

const io = new SocketIO.Server(httpServer, {
    cors : {
        origin : "*",
        credentials : false,
        methods : ["GET", "POST", "PUT", "DELETE"]
    }
})

io.on('connection', socket => {
    SocketIoHelper.initSocket(socket, io);
});