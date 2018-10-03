const debug = require('debug')('abigail:tplink')
const { login } = require('tplink-cloud-api')

class TPLink {
    constructor() {
        this.service = null
    }

    async connect() {
        this.service = await login(process.env.TPLINK_USERNAME, process.env.TPLINK_PASSWORD)
        debug(`TPLink auth token: ${this.service.getToken()}`)
    }

    async turnOnBulb() {
        try {
            await this.service.getLB100('Sala de estar').setState(1, 100)
        } catch (error) {
            debug(`Error al intentar encender la luz: ${error}`)
        }
    }

    async turnOffBulb() {
        try {
            await this.service.getLB100('Sala de estar').setState(0, 0)
        } catch (error) {
            debug(`Error al intentar apagar la luz: ${error}`)
        }
    }
}

module.exports = new TPLink()