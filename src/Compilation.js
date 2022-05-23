class Compilation {
    constructor() {
        this.dependencyFactories = new Map()
        this.entries = new Map()
        this.compiler = null
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
        { factory, dependencies, originModule, context, recursive = true },
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
                    this.handleModuleBuildAndDependencies(
                        originModule,
                        module,
                        recursive,
                        callback,
                    )
                })
            },
        )
    }
    factorizeModule(
        { factory, dependencies, originModule, contextInfo, context },
        callback,
    ) {
        factory.create(
            {
                contextInfo: {
                    issuer: originModule ? originModule.nameForCondition() : '',
                    issuerLayer: originModule ? originModule.layer : null,
                    compiler: this.compiler.name,
                    ...contextInfo,
                },
                resolveOptions: originModule
                    ? originModule.resolveOptions
                    : undefined,
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
                callback(null, result.module)
            },
        )
    }
    addModule(module, callback) {
        const identifier = module.identifier()
        const alreadyAddedModule = this._modules.get(identifier)
        if (alreadyAddedModule) {
            return callback(null, alreadyAddedModule)
        }

        this._modules.set(identifier, module)
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
        module.needBuild(
            {
                compilation: this,
            },
            (err, needBuild) => {
                if (err) return callback(err)
                if (!needBuild) {
                    return callback()
                }
                this.builtModules.add(module)
                module.build((err, callback) => {
                    return callback(err, callback)
                })
            },
        )
    }
    processModuleDependencies(module, callback) {
        if (module.dependencies.length === 0) {
            callback()
        } else {
            for (const dependency of module.dependencies) {
                this.handleModuleCreation(dependency, err => {
                    return callback(err)
                })
            }
        }
    }
}

module.exports = Compilation
