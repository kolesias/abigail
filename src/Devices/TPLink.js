const debug = require('debug')('abigail:tplink')
const { login } = require('tplink-cloud-api')

class TPLink {
    constructor() {
        this.service = null
    }

    async connect() {
        this.service = await login(process.env.TPLINK_USERNAME, process.env.TPLINK_PASSWORD)
        debug(`TPLink auth token: ${this.service.getToken()}`)

        await this.service.getDeviceList()
    }

    async turnOnBulb() {
        try {
            await this.service.getLB100('Luz de la sala').setState(1, 100)
            debug('Luz encendida')
        } catch (error) {
            debug(`Error al intentar encender la luz: ${error}`)
        }
    }

    async turnOffBulb() {
        try {
            await this.service.getLB100('Luz de la sala').setState(0, 0)
            debug('Luz apagada')
        } catch (error) {
            debug(`Error al intentar apagar la luz: ${error}`)
        }
    }
}

module.exports = new TPLink()