var packageConfig = require("../package.json");
var baseConfig = {};
["name", "version", "author", "description"].forEach(function(e) {
	baseConfig[e] = packageConfig[e];
});
var settings = {
	name: "BWG查看器",
	manifest_version: 2,
	icons: {
		"16": "assets/logo16.png",
		"32": "assets/logo32.png",
		"48": "assets/logo48.png",
		"128": "assets/logo128.png"
	},
	browser_action: {
		default_popup: "popup/popup.html",
		default_icon: {
			"16": "assets/logo16.png",
			"32": "assets/logo32.png",
			"48": "assets/logo48.png",
			"128": "assets/logo128.png"
		}
	},
	permissions: ["storage", "http://homestead.test/", "http://59.110.159.233:8080/"],
	content_security_policy: "script-src 'self' 'unsafe-eval'; object-src 'self'"
};
module.exports = Object.assign({}, baseConfig, settings);
