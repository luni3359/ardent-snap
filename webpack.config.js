const path = require("path");
// const webpack = require("webpack");

const output_path = path.resolve(__dirname, "dist");

module.exports = {
    mode: "development",
    entry: "./src/main.js",
    devtool: false,             // makes output file readable

    optimization: {
        minimize: false,
    },
    output: {
        path: output_path,
        filename: "main.js",
    },
    devServer: {
        port: 8080,
        static: {
            directory: output_path,
        },
    },
    module: {
        rules: [
            {
                test: /\.s[ac]ss$/i,
                use: [
                    "style-loader",
                    "css-loader",
                    "sass-loader"
                ]
            }
        ]
    }
    // plugins: [
    //     new webpack.HotModuleReplacementPlugin()
    // ],
};
