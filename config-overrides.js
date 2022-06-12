const { override, addDecoratorsLegacy } = require("customize-cra");

module.exports = override(addDecoratorsLegacy(), () => ({
	images: {
		domains: ["https://cdn.weatherapi.com/"],
	},
}));
