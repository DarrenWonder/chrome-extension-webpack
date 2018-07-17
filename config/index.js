var path = require('path')
module.exports = {
	development: {
		assetsRoot: path.resolve(__dirname, "../dist"),
		assetsSub: "assets",
		assetsPublicPath: "/",
		sourcePath: path.resolve(__dirname, "../src"),
		sourceMap: true,
		cssExtra: false,
		devtool: 'cheap-module-eval-source-map',
		endPoint: 'http://homestead.test/'
	},
	production: {
		assetsRoot: path.resolve(__dirname, "../dist"),
		assetsSub: "assets",
		assetsPublicPath: "/",
		sourcePath: path.resolve(__dirname, "../src"),
		sourceMap: false,
		cssExtra: true,
		devtool: '#source-map',
		endPoint: 'http://59.110.159.233:8080/'
	}
}