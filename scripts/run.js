var utils = require("./utils");
var settings = require("../config/settings");
var ora = require("ora");
var rm = require("rimraf");
var path = require("path");
var chalk = require("chalk");
var webpack = require("webpack");
var mode = process.env.NODE_ENV;
var webpackConfig =
	mode === "development"
		? require("./webpack.dev.conf")
		: require("./webpack.prod.conf");
var config = require("../config")[mode];


rm(config.assetsRoot, err => {
	if (err) throw err;
	var compiler = webpack(webpackConfig);
	if (mode === "development") {
		var spinner = ora("building for development...");
		spinner.start();
		compiler.watch(
			{
				aggregateTimeout: 300,
				poll: undefined
			},
			(err, stats) => {
				spinner.stop();
				if (err) throw err;
				console.log(
					stats.toString({
						colors: true,
						modules: false,
						children: false, // If you are using ts-loader, setting this to true will make TypeScript errors show up during build.
						chunks: false,
						chunkModules: false
					}) + "\n"
				);

				if (stats.hasErrors()) {
					console.log(chalk.red("  Build failed with errors.\n"));
					process.exit(1);
				}
				utils.writeJson(
					settings,
					config.assetsRoot + "/manifest.json",
					function(err) {
						if (err) throw err;
					}
				);
				console.log(chalk.cyan("Build success. Watching mode..."));
			}
		);
	} else if (mode === "production") {
		var spinner = ora("building for production...");
		spinner.start();
		compiler.run((err, stats) => {
			spinner.stop();
			if (err) throw err;
			console.log(
				stats.toString({
					colors: true,
					modules: false,
					children: false, // If you are using ts-loader, setting this to true will make TypeScript errors show up during build.
					chunks: false,
					chunkModules: false
				}) + "\n"
			);

			if (stats.hasErrors()) {
				console.log(chalk.red("  Build failed with errors.\n"));
				process.exit(1);
			}
			utils.writeJson(
				settings,
				config.assetsRoot + "/manifest.json",
				function(err) {
					if (err) throw err;
				}
			);
			console.log(chalk.cyan("Build success"));
		});
	}
});
