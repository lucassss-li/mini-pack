const F = (obj, prop, factory) => {
    if (obj[prop] === undefined) {
        obj[prop] = factory()
    }
}

function applyWebpackOptionsBaseDefaults(options) {
    F(options, 'context', () => process.cwd())
}
function applyWebpackOptionsDefaults() {
    console.log('合并用户和默认配置')
}

module.exports = {
    applyWebpackOptionsBaseDefaults,
    applyWebpackOptionsDefaults,
}
