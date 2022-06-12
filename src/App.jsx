import React from "react";
import axios from "axios";

import unknownIcon from "./icons/unknown.png";
import "./styles/App.css";

export default function App() {
	const [weatherIcon, setWeatherIcon] = React.useState("unknown");
	const [weatherType, setWeatherType] = React.useState(
		"unknown weather type"
	);
	const [coordinates, setCoordinates] = React.useState("unknown");
	const [location, setLocation] = React.useState("unknown");
	const [dayNight, setDayNight] = React.useState("unknown");
	const [dateTime, setDateTime] = React.useState("unknown");

	const containerRef = React.useRef(null);
	const temperatureValueRef = React.useRef(null);
	const notificationRef = React.useRef(null);
	const loaderRef = React.useRef(null);
	const modalContainerRef = React.useRef(null);
	const modalToggleRef = React.useRef(null);
	const updateIntervalRef = React.useRef(null);

	React.useEffect(() => {
		const weather = {
			temp: {
				unit: "celsius",
			},
		};

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
			notificationRef.current.parentElement.style.display = "block";
			notificationRef.current.innerText = error.message;

			removePreloader();
		};

		const getWeather = (latitude, longitude) => {
			axios(
				`https://api.weatherapi.com/v1/current.json?key=${process.env.REACT_APP_API_KEY}&q=${latitude},${longitude}`
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

		navigator.geolocation
			? navigator.geolocation.getCurrentPosition(setPosition, showError, {
					timeout: 10000,
					maximumAge: Infinity,
			  })
			: showError({
					message: "Your browser doesn't support location services.",
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

		modalToggleRef.current.onclick = () =>
			modalContainerRef.current.classList.toggle("show");
	}, []);

	return (
		<React.Fragment>
			<div className="container" ref={containerRef}>
				<div className="app-title">
					<p>WeatherFinder</p>
					<button className="settings-button" ref={modalToggleRef}>
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
							alt="weather icon"
						/>
					</div>
					<div className="temperature-value">
						<p ref={temperatureValueRef} />
					</div>
					<div className="weather-type">
						<p>{weatherType}</p>
					</div>
					<div className="location">
						<p>
							Nearest location: <span>{location}</span>
						</p>
					</div>
					<div className="coords">
						<p>
							Coordinates: <span>{coordinates}</span>
						</p>
					</div>
				</div>
				<div
					className="app-title"
					style={{ marginTop: 20, fontSize: "0.5rem" }}
				>
					<p>Developed by Siddharth Praveen Bharadwaj (KV IISc)</p>
				</div>
			</div>
			<div className="loader-wrapper" ref={loaderRef}>
				<div className="loader"></div>
				<p>Trying to determine location...</p>
			</div>
			<div className="modal-container" ref={modalContainerRef}>
				<div className="modal-content">
					<div className="modal-title">
						<p>Settings</p>
						<button className="close-button" ref={modalToggleRef}>
							<span className="fas fa-times" />
						</button>
					</div>
					<div className="modal-body">
						<div className="modal-row">
							<div className="modal-label">
								<p>Update interval:</p>
							</div>
							<div className="modal-input">
								<select ref={updateIntervalRef}>
									<option value="minutely">Minutely</option>
									<option value="hourly">Hourly</option>
									<option value="daily">Daily</option>
								</select>
							</div>
						</div>
					</div>
				</div>
			</div>
		</React.Fragment>
	);
}
