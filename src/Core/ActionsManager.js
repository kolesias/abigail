const debug = require('debug')('abigail:actions-manager')
const argv = require('minimist')(process.argv.slice(2))
const find = require('lodash/find')
const WsServer = require('../Servers/WsServer')
const actions = require('../Core/Actions')

class ActionsManager {
    constructor() {

    }

    exec(command, value) {
        value = value || null

        if (argv.tunnel === true) {
            WsServer.send({
                command,
                value
            })
        } else {
            let action = find(actions, { command })

            if (action === undefined) {
                debug('Comando desconocido')
                return
            }

            action.handler(value)
        }
    }
}

module.exports = new ActionsManager()