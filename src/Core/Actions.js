const SteamClient = require('../Steam/SteamClient')
const notifier = require('node-notifier')
const SonyBravia = require('../Devices/SonyBravia')
const TPLink = require('../Devices/TPLink')

module.exports = [
    {
        path: '/call/:value',

        command: 'call',

        handler(name) {
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
            if (room === 'sala') {
                SonyBravia.turnOff()
                TPLink.turnOffBulb()
            }
        }
    },
]