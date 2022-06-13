import React from "react";
import axios from "axios";

import { useTranslation } from "react-i18next";
import i18n from "./language/i18n";
import LocaleContext from "./language/localeContext";

import unknownIcon from "./icons/unknown.png";

// TODO: Malayalam (ml)+ locales
export default function App() {
	const { t } = useTranslation();
	const { localeContext } = React.useContext(LocaleContext);

	const [weatherIcon, setWeatherIcon] = React.useState("unknown");
	const [weatherType, setWeatherType] = React.useState(
		"unknown weather type"
	);
	const [coordinates, setCoordinates] = React.useState("unknown");
	const [location, setLocation] = React.useState("unknown");
	const [dayNight, setDayNight] = React.useState("unknown");
	const [dateTime, setDateTime] = React.useState("unknown");

	const [showModal, setShowModal] = React.useState(false);
	const [modalDisabled, setModalDisabled] = React.useState(false);

	const containerRef = React.useRef(null);
	const temperatureValueRef = React.useRef(null);
	const notificationRef = React.useRef(null);
	const loaderRef = React.useRef(null);
	const modalContainerRef = React.useRef(null);
	const languageRef = React.useRef(null);

	React.useEffect(() => {
		const weather = {
			temp: {
				unit: "celsius",
			},
		};

		const changeLocale = l => localeContext !== l && i18n.changeLanguage(l);

		const removePreloader = () => {
			containerRef.current.style.filter = "none";
			loaderRef.current.style.display = "none";
		};

		const setPosition = position => {
			getWeather(position.coords.latitude, position.coords.longitude);
			setCoordinates(
				`${position.coords.latitude}, ${position.coords.longitude}`
			);

			removePreloader();
		};

		const showError = error => {
			setModalDisabled(true);
			notificationRef.current.parentElement.style.display = "block";
			notificationRef.current.innerText = t(error.message);

			removePreloader();
		};

		const getWeather = (latitude, longitude) => {
			axios(
				`https://api.weatherapi.com/v1/current.json?key=${process.env.REACT_APP_WEATHER_API_KEY}&q=${latitude},${longitude}&lang=${i18n.language}`
			)
				.then(r => {
					weather.temp.value = Math.floor(r.data.current.temp_c);
					weather.description = r.data.current.condition.text;
					weather.iconId = r.data.current.condition.icon;

					weather.city = r.data.location.name;
					weather.region = r.data.location.region;
					weather.country = r.data.location.country;
					weather.date = r.data.location.localtime;

					setDayNight(r.data.current.is_day);
				})
				.then(() => displayWeather())
				.catch(e => console.error(e));
		};

		const displayWeather = () => {
			setWeatherIcon(weather.iconId);
			setDateTime(weather.date);
			temperatureValueRef.current.innerHTML = `${weather.temp.value}°<span>C</span>`;
			setWeatherType(weather.description);
			setLocation(
				`${weather.city}, ${weather.region}, ${weather.country}`
			);
		};

		const getGeolocation = () =>
			navigator.geolocation
				? navigator.geolocation.getCurrentPosition(
						setPosition,
						showError,
						{
							timeout: 20000,
							maximumAge: Infinity,
						}
				  )
				: showError({
						message: t(
							"Your browser doesn't support location services."
						),
				  });

		temperatureValueRef.current.onclick = () => {
			if (weather.temp.value === undefined) return;

			if (weather.temp.unit === "celsius") {
				temperatureValueRef.current.innerHTML = `${Math.floor(
					(weather.temp.value * 9) / 5 + 32
				)}°<span>F</span>`;
				weather.temp.unit = "fahrenheit";
			} else {
				temperatureValueRef.current.innerHTML = `${weather.temp.value}°<span>C</span>`;
				weather.temp.unit = "celsius";
			}
		};

		languageRef.current.onchange = () => {
			localStorage.setItem("language", languageRef.current.value);
			changeLocale(languageRef.current.value);

			!showModal && getGeolocation();
		};

		getGeolocation();
	}, [localeContext, showModal, t]);

	return (
		<React.Fragment>
			<div className="container" ref={containerRef}>
				<div className="app-title">
					<p>WeatherFinder</p>
					<button
						className="settings-button"
						disabled={modalDisabled}
						onClick={() => setShowModal(true)}
					>
						<span className="fas fa-cog" />
					</button>
				</div>
				<div className="date-time">
					<p>
						{dateTime.split(" ")[0]} {dateTime.split(" ")[1]}
					</p>
				</div>
				<div className="notification">
					<p ref={notificationRef} />
				</div>
				<div className="weather-container">
					<div className="weather-icon">
						<img
							src={
								dayNight === "unknown"
									? unknownIcon
									: `https:${weatherIcon}`
							}
							alt={t("Weather Icon")}
						/>
					</div>
					<div className="temperature-value">
						<p ref={temperatureValueRef} />
					</div>
					<div className="data-big">
						<p>{weatherType}</p>
					</div>
					<div className="data">
						<p>
							{t("Nearest location")}: <span>{location}</span>
						</p>
					</div>
					<div className="data">
						<p>
							{t("Coordinates")}: <span>{coordinates}</span>
						</p>
					</div>
				</div>
				<div
					className="app-title"
					style={{
						marginTop: "clamp(20px, 50%, 40px)",
						fontSize: "0.5rem",
					}}
				>
					<p>
						{t(
							"Developed by Siddharth Praveen Bharadwaj (KV IISc)"
						)}
					</p>
				</div>
			</div>
			<div className="loader-wrapper" ref={loaderRef}>
				<div className="loader"></div>
				<p>{t("Trying to determine location")}...</p>
			</div>
			<div
				className="modal-container"
				ref={modalContainerRef}
				style={{
					visibility: showModal ? "visible" : "hidden",
					opacity: showModal ? 1 : 0,
				}}
			>
				<div className="modal-content">
					<div className="modal-title">
						<p>{t("Settings")}</p>
						<button
							className="close-button"
							disabled={modalDisabled}
							onClick={() => setShowModal(false)}
						>
							<span className="fas fa-times" />
						</button>
					</div>
					<div className="modal-body">
						<div className="modal-row">
							<div className="modal-label">
								<p>{t("Language")}:</p>
							</div>
							<div className="modal-input">
								<select
									ref={languageRef}
									defaultValue={
										localStorage.getItem("language") || "en"
									}
								>
									<optgroup label={t("Main Languages")}>
										<option value="en">
											English (Default)
										</option>
										<option value="hi">Hindi हिंदी</option>
									</optgroup>
									<optgroup label={t("Regional Languages")}>
										<option value="bn">
											Bengali বাংলা
										</option>
										<option value="mr">
											Marathi मराठी
										</option>
										<option value="te">
											Telugu తెలుగు
										</option>
										<option value="ta">Tamil தமிழ்</option>
										<option value="ur">Urdu اردو</option>
										<option value="gu">
											Gujarati ગુજરાતી
										</option>
										<option value="kn">
											Kannada ಕನ್ನಡ
										</option>
										<option value="ml">
											Malayalam മലയാളം
										</option>
										<option value="or">Oriya ଓଡ଼ିଆ</option>
										<option value="pa">
											Punjabi ਪੰਜਾਬੀ
										</option>
										<option value="as">
											Assamese অসমীয়া
										</option>
									</optgroup>
								</select>
							</div>
						</div>
					</div>
				</div>
			</div>
		</React.Fragment>
	);
}
