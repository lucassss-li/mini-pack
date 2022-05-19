const webpack = require('../src/webpack.js')
const options = require('./webpack.config.js')

webpack(options, (err, stats) => {
    console.log('succeed')
})
