const SteamClient = require('../Steam/SteamClient')
const notifier = require('node-notifier')
const SonyBravia = require('../Devices/SonyBravia')
const TPLink = require('../Devices/TPLink')

module.exports = [
    {
        command: 'ping',

        handler() {
            const WsClient = require('../Servers/WsClient')
            WsClient.send('pong')
        }
    },

    {
        path: '/call/:value',

        command: 'call',

        handler(name) {
            name = name.trim().toLowerCase().replace('a ', '').trim()

            if (name === 'ivan') {
                notifier.notify({
                    title: '¡Te estan llamando!',
                    message: 'Desde Google Home Mini.',
                    icon: 'abi.jpg'
                })
            }

            SteamClient.execCall(name)
        }
    },

    {
        path: '/turn-on/:value',

        command: 'turn-on',

        handler(room) {
            room.trim().toLowerCase()

            if (room === 'sala') {
                SonyBravia.turnOn()
                TPLink.turnOnBulb()
            }
        }
    },

    {
        path: '/turn-off/:value',

        command: 'turn-off',

        handler(room) {
            room.trim().toLowerCase()

            if (room === 'sala') {
                SonyBravia.turnOff()
                TPLink.turnOffBulb()
            }
        }
    },
]