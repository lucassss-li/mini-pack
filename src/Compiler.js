const {
    SyncBailHook,
    SyncHook,
    AsyncParallelHook,
    AsyncSeriesHook,
} = require('tapable')

const Compilation = require('./Compilation')
const NormalModuleFactory = require('./NormalModuleFactory')
class Compiler {
    constructor() {
        this.hooks = {
            entryOption: new SyncBailHook(['context', 'entry']),
            beforeRun: new AsyncSeriesHook(['compiler']),
            run: new AsyncSeriesHook(['compiler']),
            beforeCompile: new AsyncSeriesHook(['params']),
            compile: new SyncHook(['params']),
            thisCompilation: new SyncHook(['compilation', 'params']),
            compilation: new SyncHook(['compilation', 'params']),
            make: new AsyncParallelHook(['compilation']),
            finishMake: new AsyncSeriesHook(['compilation']),
            afterCompile: new AsyncSeriesHook(['compilation']),
            failed: new SyncHook(['error']),
            afterDone: new SyncHook(['stats']),
        }
    }
    run(callback) {
        const finalCallback = (err, stats) => {
            if (err) {
                this.hooks.failed.call(err)
            }
            if (callback !== undefined) callback(err, stats)
            this.hooks.afterDone.call(stats)
        }
        const onCompiled = (err, compilation) => {
            finalCallback(err, compilation)
        }
        const run = () => {
            this.hooks.beforeRun.callAsync(this, err => {
                if (err) return finalCallback(err)
                this.hooks.run.callAsync(this, err => {
                    if (err) return finalCallback(err)
                    this.compile(onCompiled)
                })
            })
        }
        run()
    }
    createNormalModuleFactory() {
        const normalModuleFactory = new NormalModuleFactory({
            context: this.options.context,
            fs: this.inputFileSystem,
            // TODO:配置resolver
            // resolverFactory: this.resolverFactory,
            options: this.options.module,
        })
        return normalModuleFactory
    }
    newCompilationParams() {
        const params = { normalModuleFactory: this.createNormalModuleFactory() }
        return params
    }
    newCompilation(params) {
        const compilation = new Compilation(this, params)
        compilation.name = this.name
        compilation.compiler = this
        this.hooks.thisCompilation.call(compilation, params)
        this.hooks.compilation.call(compilation, params)
        return compilation
    }
    compile(onCompiled) {
        // STEP:实例化对应模块的模块工厂
        const params = this.newCompilationParams()
        this.hooks.beforeCompile.callAsync(params, err => {
            if (err) return onCompiled(err)
            this.hooks.compile.call(params)
            // STEP:实例化compilation
            const compilation = this.newCompilation(params)
            // STEP:触发 make 钩子，调用entryPlugin，注意这个插件是在entryOption阶段根据入口配置挂载的
            this.hooks.make.callAsync(compilation, err => {
                console.log('start make', err)
            })
        })
    }
}

module.exports = Compiler
