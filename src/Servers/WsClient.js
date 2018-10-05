const debug = require('debug')('abigail:ws-client')
const WebSocket = require('ws')
const ActionsManager = require('../Core/ActionsManager')

class WsClient {
    constructor() {
        this.port = process.env.TUNNELSERVER_PORT
        this.host = process.env.TUNNELSERVER_HOST
        this.isAlive = true
        this.retryTimeout = null
    }

    connect() {
        debug(`[${this.host}:${this.port}] Conectandose al tunel...`)

        this.client = new WebSocket(`ws://${this.host}:${this.port}`)
        this.retryTimeout = null

        this.client.on('open', this.onConnected.bind(this))
        this.client.on('message', this.onMessage)
        this.client.on('error', this.onError.bind(this))
        this.client.on('close', this.onClose.bind(this))
        this.client.on('pong', () => {
            this.isAlive = true
        })
    }

    heartbeat() {
        if (this.client.readyState === WebSocket.CLOSED || this.client.readyState === WebSocket.CLOSING) {
            debug('[ping] Ya no tenemos conexión con el servidor!')
            this.retry()
            return
        }

        if (this.isAlive === false) {
            debug('[ping] No se ha recibido respuesta del servidor!')
            this.client.terminate()
            return
        }

        this.isAlive = false
        this.client.ping()
    }

    retry() {
        if (this.retryTimeout !== null) {
            return
        }

        this.retryTimeout = setTimeout(() => {
            this.connect()
        }, 1500)
    }

    onConnected() {
        debug(`Conexión éxitosa al túnel`)

        setInterval(() => {
            this.heartbeat()
        }, 15000)
    }

    onMessage(message) {
        debug(`Se ha recibido un mensaje desde el túnel: ${message}`)
        message = JSON.parse(message)

        if (message.command === undefined) {
            debug('¡Comando inválido!')
            return
        }

        ActionsManager.exec(message.command, message.value)
    }

    onError(error) {
        debug(`Error al intentar conectarse al túnel: ${error}`)
    }

    onClose(code, reason) {
        debug(`Se ha perdido la conexión al túnel: ${reason}`)
        this.retry()
    }
}

module.exports = new WsClient()