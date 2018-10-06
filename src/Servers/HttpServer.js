const debug = require('debug')('abigail:http-server')
const http = require('express')()
const bus = require('../Core/Bus')
const ActionsManager = require('../Core/ActionsManager')
const actions = require('../Core/Actions')

class HttpServer {
    constructor() {
        this.host = process.env.HTTPSERVER_BIND
        this.port = process.env.HTTPSERVER_PORT
    }

    boot() {
        this.routes()

        http.listen(this.port, this.host, () => {
            debug(`[${this.host}:${this.port}] API`)
        })
    }

    routes() {
        http.get('/', (req, res) => res.send('Abigaíl Home Assistant API'))

        http.get('/ping', (req, res) => {
            const WsServer = require('../Servers/WsServer')

            if (WsServer.isConnected()) {
                res.end()
            } else {
                res.end(404)
            }
        })

        for (let action of actions) {
            if (action.path === undefined) {
                continue
            }

            http.get(`/actions${action.path}`, (req, res) => {
                debug(`API: ${action.path} - ${action.command} - ${req.params.value}`)
                ActionsManager.exec(action.command, req.params.value)
                res.end()
            })
        }
    }
}

module.exports = new HttpServer()