const Compiler = require('./Compiler')
const { applyWebpackOptionsBaseDefaults } = require('./defaults')
const NodeEnvironmentPlugin = require('./NodeEnvironmentPlugin')
const WebpackOptionsApply = require('./WebpackOptionsApply')

module.export = function webpack(options, callback) {
    const compiler = createCompiler(options)
    compiler.run(callback)
}
const createCompiler = options => {
    applyWebpackOptionsBaseDefaults(options)
    // STEP:实例化compiler
    const compiler = new Compiler(options.context, options)
    // STEP:添加node环境下的文件读写功能
    new NodeEnvironmentPlugin().apply(compiler)
    // STEP:挂载用户配置的plugin
    if (Array.isArray(options.plugins)) {
        for (const plugin of options.plugins) {
            if (typeof plugin === 'function') {
                plugin.call(compiler, compiler)
            } else {
                plugin.apply(compiler)
            }
        }
    }
    // STEP:根据配置项挂载内置plugin
    new WebpackOptionsApply().process(options, compiler)
    return compiler
}
