class Chunk {
    constructor(name) {
        this.name = name
        this.files = {}
        this.main = null
    }
    addModule(name, code, isMain = false) {
        this.files[name] = code
        if (isMain) this.main = name
    }
}
module.exports = Chunk
