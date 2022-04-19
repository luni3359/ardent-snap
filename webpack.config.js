const path = require("path");

const OUTPUT_PATH = path.resolve(__dirname, "dist");

module.exports = {
    mode: "development",

    entry: "./src/main.js",
    output: {
        filename: "main.js",
        path: OUTPUT_PATH,
        assetModuleFilename: "img/[name][ext]"
    },

    module: {
        rules: [
            {
                test: /\.scss$/i,
                use: [
                    "style-loader",
                    "css-loader",
                    "postcss-loader",
                    "sass-loader",
                ]
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                type: "asset/resource"
            }
        ]
    },

    devtool: "source-map",
    devServer: {
        hot: false,
        port: 8080,
        static: {
            directory: OUTPUT_PATH,
        },
    },
};
