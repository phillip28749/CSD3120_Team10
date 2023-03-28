const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = {
    entry: path.resolve(__dirname,'./src/index.ts'),
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist/app')
    },
    resolve: {
        extensions: [".ts", ".js"]
    },
    module: {
        rules: [
            {   
                test: [/\.tsx?$/, /\.(png|jpg|gif)$/],
                loader: "ts-loader",
            }
        ]
    },
    mode: "development",
    devtool: 'inline-source-map',
    devServer: {
        static: [
            {
                directory: path.join(__dirname, 'public/assets'),
            }
        ],
        port: 3005,
        server: 'http'
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname,'src/index.html')
        }),
        new CopyPlugin({
            patterns: [
                { 
                    from: path.resolve(__dirname, 'public'),
                    // globOptions:{
                    //     ignore: ['**/test/**']
                    // }
                }

            ]
        }),

    ]
};