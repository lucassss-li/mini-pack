class Dependency {
    constructor() {
        this._parentModule = undefined
        this._loc = undefined
    }
    get type() {
        return 'unknown'
    }
    get category() {
        return 'unknown'
    }
}

module.exports = Dependency
