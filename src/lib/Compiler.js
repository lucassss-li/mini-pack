const {
    Tapable,
    AsyncSeriesHook,
    AsyncParallelHook,
    SyncBailHook,
    SyncHook,
} = require('tapable')

const NormalModuleFactory = require('./NormalModuleFactory.js')
const Compilation = require('./Compilation.js')
class Compiler extends Tapable {
    constructor(context) {
        super(context)
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
        }
    }
    run(callback) {
        console.log('run 方法执行了')
        const finalCallback = function (err, stats) {
            callback(err, stats)
        }
        const onCompiled = function (err, compilation) {
            console.log('onCompiled', compilation)
            finalCallback(err, {
                toJson() {
                    return {
                        entries: [],
                        chunks: [],
                        modules: [],
                        assets: [],
                    }
                },
            })
        }
        this.hooks.beforeRun.callAsync(this, err => {
            if (err) return callback(err)
            this.hooks.run.callAsync(this, err => {
                if (err) return callback(err)
                this.compile(onCompiled)
            })
        })
    }
    compile(callback) {
        callback()
        const params = this.newCompilationParams()
        this.hooks.beforeCompile.callAsync(params, err => {
            if (err) return callback(err)
            this.hooks.compile.call(params)
            const compilation = this.newCompilation()
            this.hooks.make.callAsync(compilation, err => {
                if (err) return callback(err)
                console.log('make钩子触发了')
            })
        })
    }
    newCompilationParams() {
        const params = {
            normalModuleFactory: new NormalModuleFactory(),
        }
        return params
    }
    newCompilation() {
        const compilation = this.createCompilation()
        return compilation
    }
    createCompilation() {
        return new Compilation(this.compile)
    }
}
module.exports = Compiler
