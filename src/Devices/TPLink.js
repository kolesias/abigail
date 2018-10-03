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
        await this.service.getLB100('Sala de estar').setState(1, 100)
    }

    async turnOffBulb() {
        await this.service.getLB100('Sala de estar').setState(0, 0)
    }
}

module.exports = new TPLink()