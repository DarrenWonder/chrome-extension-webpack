var merge = require("webpack-merge");
var baseWebpackConfig = require("./webpack.base.conf");
var utils = require("./utils");
var ChromeExtensionReloader = require("webpack-chrome-extension-reloader");

module.exports = merge(baseWebpackConfig, {
	plugins: [
		new ChromeExtensionReloader({
			port: 9090,
			reloadPage: true,
			entries: utils.getEntry(multi.scripts)
		})
	]
});
