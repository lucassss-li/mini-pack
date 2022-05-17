const { SyncHook } = require('tapable')
const path = require('path')
const NormalModuleFactory = require('./NormalModuleFactory.js')
const Parser = require('./Parser.js')
const async = require('neo-async')
const Chunk = require('./Chunk.js')
const ejs = require('ejs')

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
        this.chunks = []
        this.assets = {}
        this.files = []
        this.hooks = {
            succeedModule: new SyncHook(['module']),
            seal: new SyncHook(),
            beforeChunks: new SyncHook(),
            afterChunks: new SyncHook(['chunks']),
        }
    }
    addEntry(context, entry, name, callback) {
        this._addModuleChain(context, entry, name, (err, module) => {
            callback(err, module)
        })
    }
    _addModuleChain(context, entry, name, callback) {
        this.createModule(
            {
                parser,
                name,
                context,
                rawRequest: entry,
                resource: path.posix.join(context, entry),
                moduleId:
                    './' +
                    path.posix.relative(
                        context,
                        path.posix.join(context, entry),
                    ),
            },
            entryModule => {
                this.entries.push(entryModule)
            },
            callback,
        )
    }
    createModule(data, doAddEntry, callback) {
        const module = normalModuleFactory.create(data)
        const afterBuild = (err, module) => {
            //判断当前module是否有依赖
            if (module.dependencies.length > 0) {
                this.processDependencies(module, err => {
                    callback(err, module)
                })
            } else {
                callback(err, module)
            }
        }
        this.buildModule(module, afterBuild)
        doAddEntry && doAddEntry(module)
        this.modules.push(module)
    }
    buildModule(module, callback) {
        module.build(this, err => {
            this.hooks.succeedModule.call(module)
            callback(err, module)
        })
    }
    processDependencies(module, callback) {
        const dependencies = module.dependencies
        async.forEach(
            dependencies,
            (dependency, done) => {
                this.createModule({ parser, ...dependency }, null, done)
            },
            callback,
        )
    }
    seal(callback) {
        this.hooks.seal.call()
        this.hooks.beforeChunks.call()
        for (const entryModule of this.entries) {
            const chunk = new Chunk(entryModule)
            this.chunks.push(chunk)
            chunk.modules = this.modules.filter(
                module => module.name === chunk.name,
            )
        }
        this.hooks.afterChunks.call(this.chunks)
        this.createChunkAssets()
        callback()
    }
    createChunkAssets() {
        for (const chunk of this.chunks) {
            const filename = chunk.name + '.js'
            chunk.files.push(filename)
            const temPath = path.posix.join(__dirname, 'template/main.ejs')
            const tempCode = this.inputFileSystem.readFileSync(temPath, 'utf8')
            const temRender = ejs.compile(tempCode)
            const source = temRender({
                entryModuleId: chunk.entryModule.moduleId,
                modules: chunk.modules,
            })
            this.emitAssets(filename, source)
        }
    }
    emitAssets(filename, source) {
        this.assets[filename] = source
        this.files.push(filename)
    }
}
module.exports = Compilation
