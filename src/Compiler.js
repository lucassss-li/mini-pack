const { SyncBailHook, SyncHook, AsyncParallelHook } = require('tapable')
class Compiler {
    constructor() {
        this.hooks = {
            entryOption: new SyncBailHook(['context', 'entry']),
            compile: new SyncHook(['params']),
            thisCompilation: new SyncHook(['compilation', 'params']),
            compilation: new SyncHook(['compilation', 'params']),
            make: new AsyncParallelHook(['compilation']),
        }
    }
    run(callback) {
        console.log('start run')
        callback()
    }
}

module.exports = Compiler
