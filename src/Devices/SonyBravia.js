const debug = require('debug')('abigail:sony-bravia')
const wol = require('wake_on_lan')
const os = require('os')
const ipaddr = require('ipaddr.js')
const axios = require('axios')

class SonyBravia {
    constructor() {
        this.psk = process.env.BRAVIA_PSK
        this.ipAddress = process.env.BRAVIA_IP_ADDRESS
        this.macAddress = process.env.BRAVIA_MAC_ADDRESS
        this.request = axios.create({
            baseURL: `http://${this.ipAddress}/sony`,
            timeout: 5000,
            headers: { 'X-Auth-PSK': this.psk }
        })
    }

    getState() {
        let postData = {
            method: 'getPowerStatus',
            params: [],
            id: 1,
            version: '1.0'
        }

        this.request.post('/system', postData)
            .then(response => {
                debug(response.data)
            }).catch(error => {
                debug(`Error al intentar obtener la información de la TV: ${error}`)
            })
    }

    turnOn() {
        debug(`Encendiendo televisión...`)

        this.turnOnApi()
        //this.turnOnWol()
    }

    turnOnApi() {
        let postData = {
            method: 'setPowerStatus',
            params: [{
                status: true
            }],
            id: 1,
            version: '1.0'
        }

        this.request.post('/system', postData)
            .then(response => {
                debug(response.data)
            }).catch(error => {
                debug(`Error al intentar encender la TV: ${error}`)
            })
    }

    turnOnWol() {
        let networkInterfaces = os.networkInterfaces()

        for (let name in networkInterfaces) {
            if (name.includes('Docker') || name.includes('Virtual')) {
                continue
            }

            let info = networkInterfaces[name][1]
            let broadcastAddress = ipaddr.IPv4.broadcastAddressFromCIDR(info.cidr).toString()

            debug(`Enviando paquete Wake-On-Lan a ${broadcastAddress}`)

            wol.wake(this.macAddress, {
                address: broadcastAddress
            }, (error) => {
                if (error !== null) {
                    debug(`Ha ocurrido un problema al envíar el paquete Wake-On-Lan en ${broadcastAddress}: ${error}`)
                }
            })
        }
    }

    turnOff() {
        debug(`Apagando televisión...`)

        let postData = {
            method: 'setPowerStatus',
            params: [{
                status: false
            }],
            id: 1,
            version: '1.0'
        }

        this.request.post('/system', postData)
            .then(response => {
                debug(response.data)
            }).catch(error => {
                debug(`Error al intentar apagar la TV: ${error}`)
            })
    }
}

module.exports = new SonyBravia()