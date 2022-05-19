const fs = require('fs')

class NodeEnvironmentPlugin {
    apply(compiler) {
        compiler.inputFileSystem = fs.readFileSync
        compiler.outputFileSystem = fs.writeFileSync
    }
}

module.exports = NodeEnvironmentPlugin
