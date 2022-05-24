class ModuleGraphModule {
    constructor() {
        this.incomingConnections = new Set()
        this.outgoingConnections = new Set()
    }
}

class ModuleGraphConnection {
    constructor(dependency, module) {
        this.dependency = dependency
        this.module = module
    }
}

class ModuleGraph {
    constructor() {
        // STEP:Dependency—>ModuleGraphConnection
        this._dependencyMap = new WeakMap()
        // STEP:Module—>ModuleGraphModule
        this._moduleMap = new Map()
    }
    _getModuleGraphModule(module) {
        let mgm = this._moduleMap.get(module)
        if (mgm === undefined) {
            mgm = new ModuleGraphModule()
            this._moduleMap.set(module, mgm)
        }
        return mgm
    }
    setResolvedModule(dependency, module) {
        const connection = new ModuleGraphConnection(dependency, module)
        const connections =
            this._getModuleGraphModule(module).incomingConnections
        connections.add(connection)
        this._dependencyMap.set(dependency, connection)
    }
}

module.exports = ModuleGraph
