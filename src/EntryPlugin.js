const EntryDependency = require('./dependencies/EntryDependency')
class EntryPlugin {
    constructor(context, entry, options) {
        this.context = context
        this.entry = entry
        this.options = options || ''
    }
    apply(compiler) {
        compiler.hooks.compilation.tap(
            'EntryPlugin',
            (compilation, { normalModuleFactory }) => {
                compilation.dependencyFactories.set(
                    EntryDependency,
                    normalModuleFactory,
                )
            },
        )

        const { entry, options, context } = this
        const dep = EntryPlugin.createDependency(entry, options)

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
