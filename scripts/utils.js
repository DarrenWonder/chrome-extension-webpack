var glob = require("glob");
var path = require("path");
var fs = require("fs");
var config = require("../config")[process.env.NODE_ENV];
var settings = require("../config/settings");
var MiniCssExtractPlugin = require("mini-css-extract-plugin");
var HtmlWebpackPlugin = require("html-webpack-plugin");

var detectStyleSheet = function(sourcePath) {
	var res = glob.sync(sourcePath + "/**/*.*ss");
	var exts = [];
	res.forEach(function(e) {
		ext = path.extname(e).slice(1);
		if (!exts.includes(ext)) {
			exts.push(ext);
		}
	});
	return exts;
};

function addLoader(loaders, name, options) {
	loaders.push({
		loader: name + "-loader",
		options: Object.assign({}, options)
	});
}

function generateLoader(ext, options) {
	return function(loaderOptions) {
		var baseLoaders = [];
		addLoader(
			baseLoaders,
			"css",
			Object.assign({}, loaderOptions, {
				sourceMap: options.sourceMap
			})
		);
		if (ext !== "css") {
			addLoader(
				baseLoaders,
				"postcss",
				Object.assign({}, loaderOptions, {
					sourceMap: options.sourceMap
				})
			);
			if (ext !== "postcss") {
				if (ext === "sass") {
					loaderOptions.indentedSyntax = true;
				}
				ext = ext === "scss" ? "sass" : ext;
				addLoader(
					baseLoaders,
					ext,
					Object.assign({}, loaderOptions, {
						sourceMap: options.sourceMap
					})
				);
			}
		}
		if (options.extra) {
			return [MiniCssExtractPlugin.loader].concat(baseLoaders);
		} else {
			return ["style-loader"].concat(baseLoaders);
		}
	};
}

function styleLoaders(options) {
	var output = [];
	var detected = detectStyleSheet(options.sourcePath);
	detected.forEach(function(e) {
		var loader = generateLoader(e, options)();
		output.push({
			test: new RegExp("\\." + e + "$"),
			use: loader
		});
	});
	return output;
}

var SCIPT_KEYS = [
	"browser_action",
	"page_action",
	"background",
	"chrome_url_overrides",
	"content_scripts",
	"devtools_page",
	"options_page",
	"options_ui"
];

function isArray(v) {
	return Object.prototype.toString.call(v) === "[object Array]";
}

function isObject(v) {
	return Object.prototype.toString.call(v) === "[object Object]";
}

function isString(v) {
	return typeof v === "string";
}

var multiCache = {};
function multiEntry() {
	var scripts = [];
	var htmls = {};
	if (!multiCache.scripts) {
		SCIPT_KEYS.forEach(function(key) {
			if (!settings[key]) return;
			function find(option) {
				if (isArray(option)) {
					option.forEach(function(o) {
						find(o);
					});
				}
				if (isObject(option)) {
					for (var k in option) {
						if (option.hasOwnProperty(k)) {
							find(option[k]);
						}
					}
				}
				if (isString(option)) {
					if (/\.js$/.test(option)) {
						scripts.push(option.slice(0, option.indexOf(".")));
					}
					if (/\.html/.test(option)) {
						var scr = option.slice(0, option.indexOf("."));
						scripts.push(scr);
						htmls[option] = scr;
					}
				}
			}
			find(settings[key]);
		});
		multiCache = {
			scripts: scripts,
			htmls: htmls
		};
	}
	return multiCache;
}

function writeJson(content, path, cb) {
	var str = JSON.stringify(content);
	fs.writeFile(path, str, function(err) {
		if (err) return cb(err);
		cb(null);
	});
}

function binaryLoaders(assetsPath) {
	var map = {
		img: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
		media: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
		fonts: /\.(woff2?|eot|ttf|otf)(\?.*)?$/
	};
	var output = [];
	for (var k in map) {
		output.push({
			test: map[k],
			loader: "url-loader",
			options: {
				limit: 10000,
				name: "[name].[hash:7].[ext]",
				outputPath: path.join(assetsPath, k)
			}
		});
	}
	return output;
}

function getEntry(scripts) {
	var entries = {};
	scripts.forEach(function(e) {
		entries[e] = path.resolve(config.sourcePath, e);
	});
	return entries;
}

function getHtml(htmls) {
	var output = [];
	for (var k in htmls) {
		output.push(
			new HtmlWebpackPlugin({
				filename: k,
				template: path.join(config.sourcePath, k),
				chunks: [htmls[k]]
			})
		);
	}
	return output;
}

module.exports = {
	writeJson: writeJson,
	multiEntry: multiEntry,
	styleLoaders: styleLoaders,
	binaryLoaders: binaryLoaders,
	getEntry: getEntry,
	getHtml: getHtml
};
