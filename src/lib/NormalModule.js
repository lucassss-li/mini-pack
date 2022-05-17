const path = require('path')
const types = require('@babel/types')
const generator = require('@babel/generator').default
const traverse = require('@babel/traverse').default
class NormalModule {
    constructor(data) {
        this.context = data.context
        this.name = data.name
        this.moduleId = data.moduleId
        this.rawRequest = data.rawRequest
        this.parser = data.parser
        this.resource = data.resource
        this._source = ''
        this._ast = ''
        this.dependencies = []
    }
    build(compilation, callback) {
        // STEP:1、读取模块源文件
        // STEP:2、使用对应loader处理成js代码
        // STEP:3、解析成ast语法树
        // STEP:4、如果当前模块有依赖模块，递归处理依赖
        this.doBuild(compilation, err => {
            this._ast = this.parser.parse(this._source)
            traverse(this._ast, {
                CallExpression: nodePath => {
                    const node = nodePath.node
                    if (node.callee.name === 'require') {
                        const modulePath = node.arguments[0].value
                        let moduleName = modulePath.split(path.posix.sep).pop()
                        const extName =
                            moduleName.indexOf('.') === -1 ? '.js' : ''
                        moduleName += extName
                        const depResource = path.posix.join(
                            path.posix.dirname(this.resource),
                            moduleName,
                        )
                        const depModuleId =
                            './' +
                            path.posix.relative(this.context, depResource)
                        this.dependencies.push({
                            name: this.name,
                            context: this.context,
                            rawRequest: moduleName,
                            moduleId: depModuleId,
                            resource: depResource,
                        })
                        node.callee.name = '__webpack_require__'
                        node.arguments = [types.stringLiteral(depModuleId)]
                    }
                },
            })
            const { code } = generator(this._ast)
            this._source = code
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
