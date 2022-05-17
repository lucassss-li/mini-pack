class NormalModule {
    constructor(data) {
        this.name = data.name
        this.entry = data.entry
        this.rawRequest = data.rawRequest
        this.parser = data.parser
        this.resource = data.resource
        this._source = ''
        this._ast = ''
    }
    build(compilation, callback) {
        // STEP:1、读取模块源文件
        // STEP:2、使用对应loader处理成js代码
        // STEP:3、解析成ast语法树
        // STEP:4、如果当前模块有依赖模块，递归处理依赖
        this.doBuild(compilation, err => {
            this._ast = this.parser.parse(this._source)
            console.log(this._ast)
            callback(err)
        })
    }
    doBuild(compilation, callback) {
        this.getSource(compilation, (err, source) => {
            this._source = source
            callback()
        })
    }
    getSource(compilation, callback) {
        compilation.inputFileSystem.readFile(this.resource, 'utf8', callback)
    }
}

module.exports = NormalModule
