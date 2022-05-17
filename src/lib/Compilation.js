const { SyncHook } = require('tapable')
const path = require('path')
const NormalModuleFactory = require('./NormalModuleFactory.js')
const Parser = require('./Parser.js')

const normalModuleFactory = new NormalModuleFactory()
const parser = new Parser()
class Compilation {
    constructor(compiler) {
        this.compiler = compiler
        this.context = compiler.context
        this.options = compiler.options
        this.inputFileSystem = compiler.inputFileSystem
        this.outputFileSystem = compiler.outputFileSystem
        this.entries = []
        this.modules = []
        this.hooks = {
            succeedModule: new SyncHook(['module']),
        }
    }
    addEntry(context, entry, name, callback) {
        this._addModuleChain(context, entry, name, (err, module) => {
            callback(err, module)
        })
    }
    _addModuleChain(context, entry, name, callback) {
        const entryModule = normalModuleFactory.create({
            name,
            context,
            rawRequest: entry,
            resource: path.posix.join(context, entry),
            parser,
        })
        const afterBuild = function (err) {
            callback(err, entryModule)
        }
        this.buildModule(entryModule, afterBuild)
        this.entries.push(entryModule)
        this.modules.push(entryModule)
    }
    buildModule(module, callback) {
        module.build(this, err => {
            this.hooks.succeedModule.call(module)
            callback(err)
        })
    }
}
module.exports = Compilation
