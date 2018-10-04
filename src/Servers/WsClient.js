const debug = require('debug')('abigail:ws-client')
const WebSocket = require('ws')
const ActionsManager = require('../Core/ActionsManager')

class WsClient {
    constructor() {
        this.port = process.env.TUNNELSERVER_PORT
        this.host = process.env.TUNNELSERVER_HOST
    }

    connect() {
        debug(`[${this.host}:${this.port}] Conectandose al tunel...`)
        this.client = new WebSocket(`ws://${this.host}:${this.port}`)

        this.client.on('open', this.onConnected.bind(this))
        this.client.on('message', this.onMessage)
        this.client.on('error', this.onError.bind(this))
        this.client.on('close', this.onClose.bind(this))
        this.client.on('ping', () => {
            //debug('ping!')
        })
    }

    onConnected() {
        debug(`Conexión éxitosa al túnel`)
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
        this.client.terminate()

        setTimeout(() => {
            this.connect()
        }, 1500)
    }
}

module.exports = new WsClient()