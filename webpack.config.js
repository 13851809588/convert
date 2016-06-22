var webpack = require('webpack');

//webpack 不处理第三方js方法
var ignoreFiles = new webpack.IgnorePlugin(/\.\/jquery-last.js$/);

module.exports = {
    entry: "./entry.js",
    output: {
        path: __dirname,
        filename: "bundle.js"
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: "style!css" }
        ]
    },
    plugins: [
        new webpack.BannerPlugin('This file is created by zhaoda'),ignoreFiles
    ]
};