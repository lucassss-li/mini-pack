const webpack = require('../src/webpack')
const options = require('./webpack.config.js')

webpack(options, (err, stats) => {
    console.log('succeed')
})
