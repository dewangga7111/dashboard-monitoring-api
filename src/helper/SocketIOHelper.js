const LoggerUtil = require('./LoggerUtil')
class SockerIOHelper {    
    #logger = new LoggerUtil("SocketIOHelper");
    initSocket(socket, io) {
        this.socket = socket
        this.io = io
        this.#logger.info('socket initialized, id: ' + socket.id)
    }
    socketOpen() {
        if(this.socket == null || this.io == null) {
            this.#logger.info('socket null, no client has made any connection yet')
        }
        return this.socket != null
    }
    emitUpdateNotification(username) {
        console.log("emit update " + username)
        if(this.socketOpen()) {
            // this.socket.emit(`notif_${username}`, `update-notif-for-${username}`)
            this.io.sockets.emit(`notif_${username}`, `update-notif-for-${username}`)
            this.#logger.info(`notif_${username}, update-notif-for-${username}`)
        }          
    }
    emitAlert(param) {
        if(this.socketOpen()) {
            // this.socket.emit(`alert`, JSON.stringify(param))
            this.io.sockets.emit(`alert`, JSON.stringify(param))
        }
    }
}

module.exports = new SockerIOHelper()
