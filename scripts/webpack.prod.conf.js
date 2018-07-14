var merge = require("webpack-merge");
var baseWebpackConfig = require("./webpack.base.conf");
var utils = require("./utils");
var MiniCssExtractPlugin = require("mini-css-extract-plugin");
var UglifyJsPlugin = require("uglifyjs-webpack-plugin");
var OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

var mode = process.env.NODE_ENV;
var config = require("../config")[mode];
var multi = utils.multiEntry();

function recursiveIssuer(m) {
	if (m.issuer) {
		return recursiveIssuer(m.issuer);
	} else if (m.name) {
		return m.name;
	} else {
		return false;
	}
}

function groups(argument) {
	var group = {};
	multi.scripts.forEach(function(e) {
		group[e + "Style"] = {
			name: e,
			test: function(m, c, entry) {
				entry = entry || e;
				return (
					m.constructor.name === "CssModule" &&
					recursiveIssuer(m) === entry
				);
			},
			chunks: "all",
			enforce: true
		};
	});
	return group;
}

module.exports = merge(baseWebpackConfig, {
	optimization: {
		minimizer: [
			new UglifyJsPlugin({
				uglifyOptions: {
					compress: {
						warnings: false
					}
				},
				cache: true,
				parallel: true,
				sourceMap: config.sourceMap // set to true if you want JS source maps
			}),
			new OptimizeCSSAssetsPlugin({
				cssProcessorOptions: config.sourceMap
					? { safe: true, map: { inline: false } }
					: { safe: true }
			})
		],
		splitChunks: {
			cacheGroups: groups()
		}
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: "[name].css"
		})
	]
});
