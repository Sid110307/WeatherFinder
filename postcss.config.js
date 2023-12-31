module.exports = {
    syntax: "postcss-scss",
    plugins: [
        require("postcss-import"),
        require("postcss-preset-env"),
        require("postcss-nested"),
        require("autoprefixer"),
    ],
};
