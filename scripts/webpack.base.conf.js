var path = require("path");
var utils = require("./utils");
var mode = process.env.NODE_ENV;
var multi = utils.multiEntry();
var config = require("../config")[mode];
var CopyWebpackPlugin = require("copy-webpack-plugin");

function resolve(dir) {
	return path.join(__dirname, "..", dir);
}

module.exports = {
	mode: mode,
	entry: utils.getEntry(multi.scripts),
	output: {
		path: config.assetsRoot,
		filename: "[name].js",
		publicPath: config.assetsPublicPath
	},
	resolve: {
		extensions: [".js", ".json"],
		alias: {
			"@": resolve("src")
		}
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: "babel-loader"
			},
			...utils.binaryLoaders(config.assetsSub),
			...utils.styleLoaders({
				sourcePath: config.sourcePath,
				sourceMap: config.sourceMap,
				extra: config.cssExtra
			})
		]
	},
	devtool: config.devtool,
	plugins: [
		...utils.getHtml(multi.htmls),
		new CopyWebpackPlugin([
			{
				from: path.join(config.sourcePath, config.assetsSub),
				to: config.assetsSub
			}
		])
	]
};
