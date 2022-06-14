import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

i18n.use(Backend)
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		fallbackLng: "en",
		debug: process.env.NODE_ENV === "development",
		interpolation: {
			escapeValue: false,
		},
		resources: {
			as: { translation: require("./locales/as/translation.json") },
			bn: { translation: require("./locales/bn/translation.json") },
			en: { translation: require("./locales/en/translation.json") },
			gu: { translation: require("./locales/gu/translation.json") },
			hi: { translation: require("./locales/hi/translation.json") },
			kn: { translation: require("./locales/kn/translation.json") },
			ml: { translation: require("./locales/ml/translation.json") },
			mr: { translation: require("./locales/mr/translation.json") },
			or: { translation: require("./locales/or/translation.json") },
			pa: { translation: require("./locales/pa/translation.json") },
			ta: { translation: require("./locales/ta/translation.json") },
			te: { translation: require("./locales/te/translation.json") },
			ur: { translation: require("./locales/ur/translation.json") },
		},
	});

export default i18n;
