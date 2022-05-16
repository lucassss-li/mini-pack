const { Tapable, AsyncSeriesHook } = require('tapable')
class Compiler extends Tapable {
    constructor(context) {
        super(context)
        this.context = context
        this.hooks = {
            done: new AsyncSeriesHook(['stats']),
        }
    }
    run(callback) {
        callback(null, {
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
}
module.exports = Compiler
