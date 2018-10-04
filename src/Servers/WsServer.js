const debug = require('debug')('abigail:ws-server')
const remove = require('lodash/remove')
const uuidv4 = require('uuid/v4')
const WebSocket = require('ws')

let clients = []

class WsClient {
    constructor(socket) {
        this.socket = socket
        this.id = uuidv4()
        this.isAlive = true

        debug(`Se ha conectado Abigaíl (${this.id})`)

        this.socket.on('message', this.onMessage)
        this.socket.on('close', this.onClose)
        this.socket.on('pong', this.heartbeat.bind(this))
    }

    heartbeat() {
        this.isAlive = true
    }

    onMessage(message) {
        debug(`Se ha recibido un mensaje de Abigail: ${message} - ESTO NO DEBERIA SUCEDER!`)
    }

    onClose(code, reason) {
        debug(`Se ha cerrado la conexión con Abigail: ${reason}`)
        remove(clients, (client) => client.id === this.id)
    }

    send(message) {
        message = JSON.stringify(message)

        try {
            this.socket.send(message)
        } catch (error) {
            this.terminate()
        }
    }

    terminate() {
        this.socket.terminate()
        remove(clients, (client) => client.id === this.id)
    }

    ping() {
        if (this.isAlive === false) {
            this.terminate()
            return
        }

        this.isAlive = false
        this.socket.ping()
    }
}

class WsServer {
    constructor() {
        this.host = process.env.TUNNELSERVER_BIND
        this.port = process.env.TUNNELSERVER_PORT
        this.server = null
    }

    boot() {
        this.server = new WebSocket.Server({
            host: this.host,
            port: this.port
        })

        this.server.on('listening', this.onListening.bind(this))
        this.server.on('connection', this.onConnection)
        this.server.on('error', this.onError)

        setInterval(() => {
            this.heartbeat()
        }, 15000)
    }

    heartbeat() {
        for (let client of clients) {
            client.ping()
        }
    }

    onListening() {
        debug(`[${this.host}:${this.port}] Tunel abierto`)
    }

    onConnection(socket) {
        let client = new WsClient(socket)
        clients.push(client)
    }

    onError(error) {
        debug(`Error al abrir el tunel: ${error}`)
    }

    sendToAll(message) {
        for (let client of clients) {
            client.send(message)
        }
    }
}

module.exports = new WsServer()