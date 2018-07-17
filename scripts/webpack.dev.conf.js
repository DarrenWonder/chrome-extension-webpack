var path = require("path");
var merge = require("webpack-merge");
var baseWebpackConfig = require("./webpack.base.conf");
var utils = require("./utils");
var multi = utils.multiEntry();
var ChromeExtensionReloader = require("webpack-chrome-extension-reloader");
var CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = merge(baseWebpackConfig, {
	plugins: [
		new CleanWebpackPlugin(["dist"], {
      root: path.resolve(__dirname, "../")
    }),
		new ChromeExtensionReloader({
			port: 9090,
			reloadPage: true,
			entries: utils.getEntry(multi.scripts)
		})
	]
});
