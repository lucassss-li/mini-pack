const webpack = require('../src/lib/webpack.js')
const options = require('./webpack.config.js')

const compiler = webpack(options)

compiler.run((err, stats) => {
    console.log('执行完毕',err)
    console.log(
        stats.toJson({
            entries: true,
            chunks: false,
            modules: false,
            assets: false,
        }),
    )
})
