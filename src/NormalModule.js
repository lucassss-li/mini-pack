const path = require('path')
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const generator = require('@babel/generator').default
const ModuleDependency = require('./dependencies/ModuleDependency')
class NormalModule {
    constructor(data) {
        this._source = null
        this.context = data.context
        this.parser = parser
        this.generator = generator
        this.rawRequest = data.dependencies[0].request
        this.request = path.posix.join(data.context, this.rawRequest)
        this.dependencies = []
        this.loaders = []
    }
    build(compilation, callback) {
        const source = compilation.compiler.inputFileSystem(
            this.request,
            'utf-8',
        )
        const ast = parser.parse(source)
        const deal = traverse_path => {
            if (traverse_path.node.callee.name === 'require') {
                traverse_path.node.callee.name = '__webpack_require__'
                this.dependencies.push(
                    new ModuleDependency(
                        './' +
                            path.posix.relative(
                                this.context,
                                path.posix.resolve(
                                    this.request,
                                    '../',
                                    traverse_path.node.arguments[0].value,
                                ),
                            ),
                    ),
                )
            }
        }
        traverse(ast, {
            CallExpression: deal,
        })
        this._source = generator(ast).code
        callback()
    }
}

module.exports = NormalModule
