const path = require('path')
module.exports = {
    context: path.resolve(__dirname, 'code'),
    entry: './index.js',
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
    },
    devtool: 'none',
}
