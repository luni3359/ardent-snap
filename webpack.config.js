const path = require("path");

let output_path = path.resolve(__dirname, "dist");

module.exports = {
    mode: "development",

    entry: "./src/main.js",
    output: {
        path: output_path,
        filename: "main.js",
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
            }
        ]
    },

    devtool: "source-map",
    devServer: {
        port: 8080,
        static: {
            directory: output_path,
        },
    },
};
