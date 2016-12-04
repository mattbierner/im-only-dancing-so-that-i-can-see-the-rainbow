"use strict";
const path = require('path');

module.exports = {
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    entry: {
        main: './src/main.js'
    },
    output: {
        path: path.join(__dirname, "js"),
        filename: "[name].js"
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                loader: 'babel',
                query: {
                    presets: ['es2015']
                }
            }
        ]
    }
};