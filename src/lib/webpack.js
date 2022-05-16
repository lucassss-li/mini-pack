const Compiler = require('./Compiler.js')
const NodeEnvironmentPlugin = require('./node/NodeEnvironmentPlugin.js')
const WebpackOptionsApply = require('./WebpackOptionsApply.js')
const webpack = function (options) {
    //STEP:1、实例化compiler对象
    const compiler = new Compiler(options.context)
    compiler.options = options
    //STEP:2、挂载NodeEnvironmentPlugin，使compiler具备读写文件能力
    new NodeEnvironmentPlugin().apply(compiler)
    //STEP:3、挂载配置文件中的plugin至compiler
    if (options.plugins && Array.isArray(options.plugins)) {
        for (const plugin of options.plugins) {
            plugin.apply(compiler)
        }
    }
    // TODO:4、依据配置项挂载内置plugins至compiler
    compiler.options = new WebpackOptionsApply().process(options, compiler)

    return compiler
}
module.exports = webpack
