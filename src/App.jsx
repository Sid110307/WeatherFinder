import React from "react";
import axios from "axios";

import { useTranslation } from "react-i18next";
import i18n from "./language/i18n";
import LocaleContext from "./language/localeContext";

import unknownIcon from "./icons/unknown.png";

export default function App() {
	const { t } = useTranslation();
	const { localeContext } = React.useContext(LocaleContext);

	const [dateTime, setDateTime] = React.useState("unknown");

	const [showModal, setShowModal] = React.useState(false);
	const [advancedMode, setAdvancedMode] = React.useState(false);
	const [modalDisabled, setModalDisabled] = React.useState(false);

	const blocksRef = React.useRef(null);
	const containerRef = React.useRef(null);
	const temperatureValueRef = React.useRef(null);
	const notificationRef = React.useRef(null);
	const loaderRef = React.useRef(null);
	const modalContainerRef = React.useRef(null);
	const languageRef = React.useRef(null);

	const weather = React.useMemo(
		() => ({ temp: { unit: "celsius" }, aqi: {} }),
		[]
	);

	React.useEffect(() => {
		const changeLocale = l => localeContext !== l && i18n.changeLanguage(l);

		const removePreloader = () => {
			containerRef.current.style.filter = "none";
			loaderRef.current.style.display = "none";
		};

		const setPosition = position => {
			getWeather(position.coords.latitude, position.coords.longitude);
			weather.coordinates = `${
				Math.round(position.coords.latitude * 100) / 100
			}, ${Math.round(position.coords.longitude * 100) / 100}`;

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
				`https://api.weatherapi.com/v1/current.json?key=${process.env.REACT_APP_WEATHER_API_KEY}&q=${latitude},${longitude}&aqi=yes&lang=${i18n.language}`
			)
				.then(r => {
					weather.temp.value = Math.floor(r.data.current.temp_c);
					weather.description = r.data.current.condition.text;
					weather.iconId = r.data.current.condition.icon;

					weather.city = r.data.location.name;
					weather.region = r.data.location.region;
					weather.country = r.data.location.country;
					weather.date = r.data.location.localtime;

					weather.windSpeed = r.data.current.wind_kph;
					weather.windDirectionDeg = r.data.current.wind_degree;
					weather.windDirection = r.data.current.wind_dir;
					weather.relativeHumidity = r.data.current.humidity;
					weather.uvIndex = r.data.current.uv;
					weather.rainfall = r.data.current.precip_mm;
					weather.pressure = r.data.current.pressure_mb;

					weather.aqi.co = parseFloat(
						r.data.current.air_quality.co
					).toFixed(2);
					weather.aqi.o3 = parseFloat(
						r.data.current.air_quality.o3
					).toFixed(2);
					weather.aqi.no2 = parseFloat(
						r.data.current.air_quality.no2
					).toFixed(2);
					weather.aqi.so2 = parseFloat(
						r.data.current.air_quality.so2
					).toFixed(2);
					weather.aqi.pm25 = parseFloat(
						r.data.current.air_quality.pm2_5
					).toFixed(2);
					weather.aqi.pm10 = parseFloat(
						r.data.current.air_quality.pm10
					).toFixed(2);

					const epaIndexes = [
						"Very Good",
						"Good",
						"Moderate",
						"Unhealthy",
						"Very Unhealthy",
						"Hazardous",
					];

					weather.aqi.epaIndex =
						epaIndexes[
							r.data.current.air_quality["us-epa-index"] - 1
						];

					weather.dayNight = r.data.current.is_day;
				})
				.then(() => displayWeather())
				.catch(e => console.error(e));
		};

		const displayWeather = () => {
			setDateTime(weather.date);
			temperatureValueRef.current.innerHTML = `${weather.temp.value}°<span>C</span>`;
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

		blocksRef.current.childNodes.forEach((child, i) => {
			child.style.animationDelay = `${i * 2}s`;
			child.style.left = `${(Math.random() * 100) << 0}%`;
		});

		setInterval(
			() =>
				blocksRef.current.childNodes.forEach(
					(child, _) =>
						(child.style.left = `${(Math.random() * 100) << 0}%`)
				),
			blocksRef.current.childNodes.length * 1000
		);

		getGeolocation();
	}, [advancedMode, localeContext, showModal, t, weather]);

	return (
		<React.Fragment>
			<div className="blocks" ref={blocksRef}>
				{[...Array(15)].map((_, i) => (
					<div key={i} className="block" />
				))}
			</div>
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
								weather.dayNight === "unknown"
									? unknownIcon
									: `https:${weather.iconId}`
							}
							alt={t("Weather Icon")}
						/>
					</div>
					<div className="temperature-value">
						<p ref={temperatureValueRef} />
					</div>
					<div className="data-big">
						<p>{weather.description || "unknown weather type"}</p>
					</div>
					<div className="data">
						<p>
							{t("Nearest location")}:{" "}
							<span>
								{weather.city}, {weather.region},{" "}
								{weather.country}
							</span>
						</p>
					</div>
					<div className="data">
						<p>
							{t("Coordinates")}:{" "}
							<span>{weather.coordinates || "unknown"}</span>
						</p>
					</div>
					<div
						className="advanced-mode-btn-wrapper"
						style={{
							transform: `translateY(${
								advancedMode ? "430px" : 0
							})`,
							zIndex: advancedMode ? 1 : 0,
						}}
					>
						<button
							className="advanced-mode-btn"
							onClick={() => setAdvancedMode(!advancedMode)}
						>
							<span
								className="fas fa-arrow-down"
								style={{
									transform: `rotate(${
										advancedMode ? "180deg" : 0
									})`,
									marginRight: 10,
								}}
							/>
							<p>{t("Advanced mode")}</p>
						</button>
					</div>
					<div
						className="advanced-mode-container"
						style={{
							visibility: advancedMode ? "visible" : "hidden",
							opacity: advancedMode ? 1 : 0,
						}}
					>
						<div className="data">
							<p>
								<span>{t("Wind")}</span>
								<span>
									{weather.windSpeed} km/h (
									{weather.windDirectionDeg}°{" "}
									{weather.windDirection})
								</span>
							</p>
						</div>
						<div className="data">
							<p>
								<span>{t("Relative humidity")}</span>
								<span>{weather.relativeHumidity}%</span>
							</p>
						</div>
						<div className="data">
							<p>
								<span>{t("UV index")}</span>
								<span>{weather.uvIndex}</span>
							</p>
						</div>
						<div className="data">
							<p>
								<span>{t("Rainfall")}</span>
								<span>{weather.rainfall} mm</span>
							</p>
						</div>
						<div className="data">
							<p>
								<span>{t("Pressure")}</span>
								<span>{weather.pressure} hPa</span>
							</p>
						</div>
						<div className="data">
							<p>
								<span>{t("Carbon Monoxide")}</span>
								<span>{weather.aqi.co} ppm</span>
							</p>
						</div>
						<div className="data">
							<p>
								<span>{t("Ozone")}</span>
								<span>{weather.aqi.o3} ppm</span>
							</p>
						</div>
						<div className="data">
							<p>
								<span>{t("Nitrogen Dioxide")}</span>
								<span>{weather.aqi.no2} ppm</span>
							</p>
						</div>
						<div className="data">
							<p>
								<span>{t("Sulfur Dioxide")}</span>
								<span>{weather.aqi.so2} ppm</span>
							</p>
						</div>
						<div className="data">
							<p>
								<span>{"PM 2.5"}</span>
								<span>{weather.aqi.pm25} ppm</span>
							</p>
						</div>
						<div className="data">
							<p>
								<span>{"PM 10"}</span>
								<span>{weather.aqi.pm10} ppm</span>
							</p>
						</div>
						<div className="data">
							<p>
								<span>{t("Air quality")}</span>
								<span>{t(weather.aqi.epaIndex)}</span>
							</p>
						</div>
					</div>
				</div>
				<div
					className="app-title"
					style={{
						marginTop: advancedMode
							? 480
							: "clamp(20px, 50%, 50px)",
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
							<span className="fas fa-xmark" />
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
					<div className="modal-body modal-footer">
						<p>
							{t("Weather data provided by")}:{" "}
							<a
								href="https://weatherapi.com/"
								target="_blank"
								rel="noopener noreferrer"
							>
								WeatherAPI
							</a>{" "}
							|{" "}
							<a
								href="https://github.com/Sid110307/WeatherFinder/"
								target="_blank"
								rel="noopener noreferrer"
							>
								{t("Source code for this project")}
							</a>
						</p>
					</div>
				</div>
			</div>
		</React.Fragment>
	);
}
