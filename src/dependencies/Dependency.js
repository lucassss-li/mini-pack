class Dependency {
    constructor() {
        this._parentModule = undefined
        this._locSL = 0
        this._locSC = 0
        this._locEL = 0
        this._locEC = 0
        this._locI = undefined
        this._locN = undefined
        this._loc = undefined
    }
    get type() {
        return 'unknown'
    }
    get category() {
        return 'unknown'
    }
    get loc() {
        if (this._loc !== undefined) return this._loc
        /** @type {SyntheticDependencyLocation & RealDependencyLocation} */
        const loc = {}
        if (this._locSL > 0) {
            loc.start = { line: this._locSL, column: this._locSC }
        }
        if (this._locEL > 0) {
            loc.end = { line: this._locEL, column: this._locEC }
        }
        if (this._locN !== undefined) {
            loc.name = this._locN
        }
        if (this._locI !== undefined) {
            loc.index = this._locI
        }
        return (this._loc = loc)
    }

    set loc(loc) {
        if ('start' in loc && typeof loc.start === 'object') {
            this._locSL = loc.start.line || 0
            this._locSC = loc.start.column || 0
        } else {
            this._locSL = 0
            this._locSC = 0
        }
        if ('end' in loc && typeof loc.end === 'object') {
            this._locEL = loc.end.line || 0
            this._locEC = loc.end.column || 0
        } else {
            this._locEL = 0
            this._locEC = 0
        }
        if ('index' in loc) {
            this._locI = loc.index
        } else {
            this._locI = undefined
        }
        if ('name' in loc) {
            this._locN = loc.name
        } else {
            this._locN = undefined
        }
        this._loc = loc
    }

    setLoc(startLine, startColumn, endLine, endColumn) {
        this._locSL = startLine
        this._locSC = startColumn
        this._locEL = endLine
        this._locEC = endColumn
        this._locI = undefined
        this._locN = undefined
        this._loc = undefined
    }
}

module.exports = Dependency
