const path = require('path')
const parser = require('@babel/parser')
const generator = require('@babel/generator').default
class NormalModule {
    constructor(data) {
        this._source = null
        this.context = data.context
        this.parser = parser
        this.generator = generator
        this.rawRequest = data.dependencies[0].request
        this.request = path.posix.join(data.context, this.rawRequest)
        this.dependencies = []
        this.loaders = []
    }
    build(callback) {
        return callback()
    }
}

module.exports = NormalModule
