const {
    Tapable,
    AsyncSeriesHook,
    AsyncParallelHook,
    SyncBailHook,
    SyncHook,
} = require('tapable')
class Compiler extends Tapable {
    constructor(context) {
        super(context)
        this.context = context
        this.hooks = {
            done: new AsyncSeriesHook(['stats']),
            entryOption: new SyncBailHook(['context', 'entry']),
            beforeCompile: new AsyncSeriesHook(['params']),
            compile: new SyncHook(['params']),
            make: new AsyncParallelHook(['compilation']),
            afterCompile: new AsyncSeriesHook(['compilation']),
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
