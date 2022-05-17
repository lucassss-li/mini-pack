const babelParser = require('@babel/parser')
const { Tapable } = require('tapable')
class Parser extends Tapable {
    parse(source) {
        return babelParser.parse(source, {
            sourceType: 'module',
            plugins: ['dynamicImport'],
        })
    }
}

module.exports = Parser
