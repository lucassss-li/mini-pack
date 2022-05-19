const Dependency = require('./Dependency')
class ModuleDependency extends Dependency {
    constructor(request) {
        super()
        this.request = request
        this.userRequest = request
    }
}

module.exports = ModuleDependency
