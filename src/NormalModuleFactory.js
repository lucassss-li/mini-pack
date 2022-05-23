const NormalModule = require('./NormalModule')
class NormalModuleFactory {
    create(data, callback) {
        const module = new NormalModule(data)
        callback({ module })
    }
}
module.exports = NormalModuleFactory
