const path = require('path')
const MinifyPlugin = require('babel-minify-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
    mode: 'development',
    devtool: 'source-map',
    context: path.resolve(__dirname, 'src'),
    entry: ['./main.js', './main.scss'],
    output: {
        path: path.resolve(__dirname, 'public')
    },
    devServer: {
        historyApiFallback: true
    },
    module: {
        rules: [{
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            loader: 'babel-loader'
        },
        {
            test: /\.(scss|css)$/,
            exclude: /node_modules/,
            use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'sass-loader']
        },
        {
            test: /\.woff(2)?$/,
            use: [{
                loader: 'url-loader',
                options: {
                    limit: 8192 // in bytes
                }
            }]
        }
    ]
    },
    plugins: [
        new MinifyPlugin({}, {
            comments: false
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css'
        })
    ]
}
