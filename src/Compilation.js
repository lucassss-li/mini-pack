const ModuleGraph = require('./ModuleGraph.js')
const ModuleDependency = require('./dependencies/ModuleDependency')
const Chunk = require('./Chunk')
class Compilation {
    constructor(compiler, params) {
        this.dependencyFactories = new Map()
        this.entries = new Map()
        this.compiler = compiler
        this.modules = new Set()
        this.builtModules = new Set()
        this.moduleGraph = new ModuleGraph()
        this.chunks = []
        this.dependencyFactories.set(
            ModuleDependency,
            params.normalModuleFactory,
        )
    }
    addEntry(context, entry, options, callback) {
        this._addEntryItem(context, entry, 'dependencies', options, callback)
    }
    _addEntryItem(context, entry, target, options, callback) {
        const { name } = options
        let entryData = this.entries.get(name)
        if (entryData === undefined) {
            entryData = {
                dependencies: [],
                includeDependencies: [],
                options: {
                    name: undefined,
                    ...options,
                },
            }
            entryData[target].push(entry)
            this.entries.set(name, entryData)
        }

        this.addModuleTree(
            {
                context,
                dependency: entry,
            },
            (err, module) => {
                if (err) {
                    return callback(err)
                }
                return callback(null, module)
            },
        )
    }
    addModuleTree({ context, dependency }, callback) {
        // STEP:获取对应的模块工厂
        const Dep = dependency.constructor
        const moduleFactory = this.dependencyFactories.get(Dep)
        this.handleModuleCreation(
            {
                factory: moduleFactory,
                dependencies: [dependency],
                originModule: null,
                context,
            },
            (err, result) => {
                if (err && this.bail) {
                    callback(err)
                } else if (!err && result) {
                    callback(null, result)
                } else {
                    callback()
                }
            },
        )
    }
    handleModuleCreation(
        { factory, dependencies, originModule, context },
        callback,
    ) {
        this.factorizeModule(
            {
                factory,
                dependencies,
                factoryResult: true,
                originModule,
                context,
            },
            (err, factoryResult) => {
                if (err) {
                    return callback(err)
                }
                const newModule = factoryResult.module

                this.addModule(newModule, (err, module) => {
                    if (err) {
                        return callback(err)
                    }
                    for (let i = 0; i < dependencies.length; i++) {
                        const dependency = dependencies[i]
                        this.moduleGraph.setResolvedModule(dependency, module)
                    }
                    this.handleModuleBuildAndDependencies(module, callback)
                })
            },
        )
    }
    factorizeModule(
        { factory, dependencies, originModule, context },
        callback,
    ) {
        factory.create(
            {
                context: context
                    ? context
                    : originModule
                    ? originModule.context
                    : this.compiler.context,
                dependencies: dependencies,
            },
            (err, result) => {
                if (err) {
                    return callback(err)
                }
                callback(null, result)
            },
        )
    }
    addModule(module, callback) {
        const alreadyAddedModule = this.modules.has(module)
        if (alreadyAddedModule) {
            return callback(null, alreadyAddedModule)
        }
        this.modules.add(module)
        callback(null, module)
    }
    handleModuleBuildAndDependencies(module, callback) {
        this.buildModule(module, err => {
            if (err) {
                return callback(err)
            }
            this.processModuleDependencies(module, err => {
                if (err) {
                    return callback(err)
                }
                callback(null, module)
            })
        })
    }
    buildModule(module, callback) {
        this.builtModules.add(module)
        module.build(this, err => {
            return callback(err)
        })
    }
    processModuleDependencies(module, callback) {
        if (module.dependencies.length === 0) {
            callback()
        } else {
            for (const dependency of module.dependencies) {
                this.addModuleTree(
                    { context: module.context, dependency },
                    err => {
                        return callback(err)
                    },
                )
            }
        }
    }
    seal() {
        for (const [name, entryData] of this.entries) {
            const chunk = new Chunk(name)
            this.chunks.push(chunk)
            const entryDependencies = entryData.dependencies[0]
            const entryModule =
                this.moduleGraph._dependencyMap.get(entryDependencies).module
            chunk.addModule(entryModule.rawRequest, entryModule._source, true)
            for (const module of this.modules) {
                const fn = new Function('module', module._source)
                chunk.addModule(module.rawRequest, fn)
            }
        }
    }
}

module.exports = Compilation
