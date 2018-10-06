const debug = require('debug')('abigail:ws-server')
const uuidv4 = require('uuid/v4')
const WebSocket = require('ws')
const bus = require('../Core/bus')

let abigail = null

class WsClient {
    constructor(socket) {
        this.id = uuidv4()
        this.socket = socket
        this.isAlive = true

        debug(`Se ha conectado Abigaíl (${this.id})`)

        this.socket.on('message', this.onMessage)
        this.socket.on('close', this.onClose.bind(this))
        this.socket.on('pong', this.heartbeat.bind(this))
    }

    // Se ha recibido respuesta, la conexión sigue activa
    heartbeat() {
        this.isAlive = true
    }

    // Se ha recibido un mensaje
    onMessage(message) {
        debug(`Se ha recibido un mensaje de Abigail: ${message}`)

        if (message === 'pong') {
            debug('Se ha recibido PONG...')
            bus.emit('pong')
        }
    }

    // Se ha cerrado la conexión
    onClose(code, reason) {
        debug(`Se ha cerrado la conexión de Abigail: ${reason}`)
        abigail = null
    }

    // Envía un mensaje a la conexión
    send(message) {
        message = JSON.stringify(message)

        try {
            this.socket.send(message)
        } catch (error) {
            this.terminate()
        }
    }

    // Cierra la conexión
    terminate() {
        this.socket.terminate()
    }

    // Hace un ping y verifica si la conexión sigue activa
    ping() {
        if (this.socket.readyState === WebSocket.CLOSED || this.socket.readyState === WebSocket.CLOSING) {
            debug('[ping] Se ha detectado una conexión cerrada!')
            abigail = null
            return
        }

        if (this.isAlive === false) {
            debug('[ping] No se ha recibido una respuesta de Abigail!')
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

    // Inicia el servidor de túnel
    boot() {
        this.server = new WebSocket.Server({
            host: this.host,
            port: this.port
        })

        this.server.on('listening', this.onListening.bind(this))
        this.server.on('connection', this.onConnection.bind(this))
        this.server.on('error', this.onError)

        setInterval(() => {
            this.heartbeat()
        }, 15000)
    }

    // Devuelve si Abigaíl esta conectada al servidor
    isConnected() {
        return abigail !== null
    }

    // Asegura que Abigaíl siga conectada
    heartbeat() {
        if (!this.isConnected()) {
            return
        }

        abigail.ping()
    }

    // Servidor iniciado
    onListening() {
        debug(`[${this.host}:${this.port}] Tunel abierto`)
    }

    // Se ha recibido una nueva conexión
    onConnection(socket) {
        if (this.isConnected()) {
            debug('Se ha recibido una nueva conexión pero Abigaíl ya esta conectada!')
            socket.terminate()
            return
        }

        abigail = new WsClient(socket)
    }

    // Ha ocurrido un error en el servidor
    onError(error) {
        debug(`Error al abrir el tunel: ${error}`)
    }

    // Envía un mensaje a abigaíl
    send(message) {
        if (!this.isConnected()) {
            return
        }

        abigail.send(message)
    }
}

module.exports = new WsServer()