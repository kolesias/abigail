const debug = require('debug')('abigail:steam')
const Steam = require('steam')
const fs = require('fs')
const sample = require('lodash/sample')

class SteamClient {
    constructor() {
        //
        this.steamClient = new Steam.SteamClient()
        this.steamUser = new Steam.SteamUser(this.steamClient)
        this.steamFriends = new Steam.SteamFriends(this.steamClient)

        this.callMessages = [
            'Te estan llamando',
            'Hey, te llaman',
            'Hay alguién hablandote',
            'Hay alguién llamandote',
            'Voltea, te hablan'
        ]

        //
        this.boot()
    }

    boot() {
        if (fs.existsSync('servers')) {
            Steam.servers = JSON.parse(fs.readFileSync('servers'))
        }

        this.steamClient.on('error', () => {
            debug('Ha ocurrido un problema al intentar conectarse a Steam.')
        })

        this.steamClient.on('servers', function (servers) {
            fs.writeFile('servers', JSON.stringify(servers))
            debug('Se ha guardado la lista de servidores')
        })
    }

    connect() {
        debug('Conectandose a Steam...')

        this.steamClient.on('connected', this.onConnected.bind(this))

        this.steamClient.on('logOnResponse', (response) => {
            if (response.eresult == Steam.EResult.OK) {
                this.onLoggedIn(response)
            }
        })

        this.steamClient.connect()
    }

    onConnected() {
        debug('Conexión éxitosa a Steam')

        this.steamUser.logOn({
            account_name: process.env.STEAM_BOT_USERNAME,
            password: process.env.STEAM_BOT_PASSWORD
        })
    }

    onLoggedIn(response) {
        debug('Se ha iniciado sesión en Steam')
        this.steamFriends.setPersonaState(Steam.EPersonaState.Online)
        this.steamFriends.setPersonaName(process.env.STEAM_BOT_NAME)
    }

    execCall(name) {
        let steamID = null

        if (name === 'ivan') {
            steamID = process.env.STEAM_IVAN_ID
        } else if (name == 'daniel') {
            steamID = process.env.STEAM_DANIEL_ID
        }

        if (steamID === null) {
            debug(`Se ha tratado de llamar a una persona inválida: ${name}`)
            return
        }

        debug(`Enviando mensaje a ${steamID} (${name})`)
        this.steamFriends.sendMessage(steamID, sample(this.callMessages))
    }
}

module.exports = new SteamClient()