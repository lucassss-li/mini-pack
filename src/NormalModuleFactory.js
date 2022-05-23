const NormalModule = require('./NormalModule')
class NormalModuleFactory {
    create(data, callback) {
        const module = new NormalModule(data)
        callback(null, { module })
    }
}
module.exports = NormalModuleFactory
