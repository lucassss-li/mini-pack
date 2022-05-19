const EntryDependency = require('./dependencies/EntryDependency')
class EntryPlugin {
    constructor(context, entry, options) {
        this.context = context
        this.entry = entry
        this.options = options || ''
    }
    apply(compiler) {
        // STEP:给compilation挂载对应的模块工厂
        compiler.hooks.compilation.tap(
            'EntryPlugin',
            (compilation, { normalModuleFactory }) => {
                compilation.dependencyFactories.set(
                    EntryDependency,
                    normalModuleFactory,
                )
            },
        )
        // STEP:初始化入口依赖
        const { entry, options, context } = this
        const dep = EntryPlugin.createDependency(entry, options)
        // STEP:进入make阶段时，向compilation中添加入口，开始编译流程
        compiler.hooks.make.tapAsync('EntryPlugin', (compilation, callback) => {
            compilation.addEntry(context, dep, options, err => {
                callback(err)
            })
        })
    }
    static createDependency(entry, options) {
        const dep = new EntryDependency(entry)
        dep.loc = { name: options.name }
        return dep
    }
}

module.exports = EntryPlugin
