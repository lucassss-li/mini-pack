const {
    AsyncSeriesHook,
    AsyncParallelHook,
    SyncBailHook,
    SyncHook,
} = require('tapable')

const path = require('path')
const mkdirp = require('mkdirp')

const NormalModuleFactory = require('./NormalModuleFactory.js')
const Compilation = require('./Compilation.js')
const Stats = require('./Stats.js')
class Compiler {
    constructor(context) {
        this.context = context
        this.hooks = {
            done: new AsyncSeriesHook(['stats']),
            entryOption: new SyncBailHook(['context', 'entry']),

            beforeRun: new AsyncSeriesHook(['compiler']),
            run: new AsyncSeriesHook(['compiler']),

            thisCompilation: new SyncHook(['compilation', 'params']),
            compilation: new SyncHook(['compilation', 'params']),

            beforeCompile: new AsyncSeriesHook(['params']),
            compile: new SyncHook(['params']),
            make: new AsyncParallelHook(['compilation']),
            afterCompile: new AsyncSeriesHook(['compilation']),

            emit: new AsyncSeriesHook(['compilation']),
        }
    }
    emitAssets(compilation, callback) {
        const emitFiles = err => {
            const assets = compilation.assets
            const outputPath = this.options.output.path
            for (const file in assets) {
                const source = assets[file]
                const targetPath = path.posix.join(outputPath, file)
                this.outputFileSystem.writeFileSync(targetPath, source, 'utf8')
            }
            callback(err)
        }
        this.hooks.emit.callAsync(compilation, err => {
            mkdirp.sync(this.options.output.path)
            emitFiles(err)
        })
    }
    run(callback) {
        const finalCallback = function (err, stats) {
            callback(err, stats)
        }
        const onCompiled = (err, compilation) => {
            this.emitAssets(compilation, err => {
                finalCallback(err, new Stats(compilation))
            })
        }
        this.hooks.beforeRun.callAsync(this, err => {
            if (err) return finalCallback(err)
            this.hooks.run.callAsync(this, err => {
                if (err) return finalCallback(err)
                this.compile(onCompiled, finalCallback)
            })
        })
    }
    compile(callback) {
        const params = this.newCompilationParams()
        this.hooks.beforeCompile.callAsync(params, err => {
            if (err) return callback(err)
            this.hooks.compile.call(params)
            const compilation = this.newCompilation(params)
            this.hooks.make.callAsync(compilation, err => {
                if (err) return callback(err)
                compilation.seal(err => {
                    if (err) return callback(err)
                    this.hooks.afterCompile.callAsync(compilation, err => {
                        callback(err, compilation)
                    })
                })
            })
        })
    }
    newCompilationParams() {
        const params = {
            normalModuleFactory: new NormalModuleFactory(),
        }
        return params
    }
    newCompilation(params) {
        const compilation = this.createCompilation()
        this.hooks.thisCompilation.call(compilation, params)
        this.hooks.compilation.call(compilation, params)
        return compilation
    }
    createCompilation() {
        return new Compilation(this)
    }
}
module.exports = Compiler
