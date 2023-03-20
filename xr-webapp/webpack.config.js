const path = require("path");
const HtmlWebAppPlugin = require("html-webpack-plugin");

module.exports = {
    entry: path.resolve(__dirname,'./src/index.ts'),
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist')
    },
    resolve: {
        extensions: [".ts",".js"]
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
    devtool: "inline-source-map",
    devServer: {
        static: [
            {
                directory: path.join(__dirname, 'assets'),
            }
        ],
        port: 3005,

    },
    plugins: [
        new HtmlWebAppPlugin({
            template: path.resolve(__dirname,"src/index.html"),
        })
    ]
};