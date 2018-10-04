const debug = require('debug')('abigail:abigail')
const argv = require('minimist')(process.argv.slice(2))
const SteamClient = require('../Steam/SteamClient')
const TPLink = require('../Devices/TPLink')
const HttpServer = require('../Servers/HttpServer')
const WsServer = require('../Servers/WsServer')
const WsClient = require('../Servers/WsClient')

class Abigail {
    constructor() {

    }

    boot() {
        debug('Iniciando...')
        //debug(argv)

        if (argv.tunnel === true) {
            // Iniciamos el servidor WebSocket que servirá como túnel
            WsServer.boot()

            // Iniciamos el servidor http para la REST API
            HttpServer.boot()
        } else {
            // Conexión a Steam
            SteamClient.connect()

            // Conexión a TPLink Kasa
            TPLink.connect()

            if (argv.standalone === true) {
                // No necesitamos un túnel, abrimos el servidor http para la REST API
                HttpServer.boot()
            } else {
                // Conexión al servidor túnel WebSocket
                WsClient.connect()
            }
        }
    }
}

module.exports = new Abigail()