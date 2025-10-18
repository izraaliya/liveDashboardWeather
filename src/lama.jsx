import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import "./App.css";

function App() {
  const [city, setCity] = useState("Jakarta");
  const [current, setCurrent] = useState(null);
  const [forecast, setForecast] = useState([]);

  const fetchWeather = async () => {
    try {
      const currentRes = await axios.get(`http://localhost:5000/current?city=${city}`);
      setCurrent(currentRes.data);

      const forecastRes = await axios.get(`http://localhost:5000/forecast?city=${city}&days=5`);
      setForecast(forecastRes.data.forecast);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch weather data. Check your Flask backend.");
    }
  };

  return (
    <div className="container">
      <h1>🌤 Weather Dashboard</h1>

      <div className="search">
        <input
          type="text"
          placeholder="Enter city..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchWeather()}
        />
        <button onClick={fetchWeather}>Search</button>
      </div>

      {current && (
        <motion.div
          className="current-weather"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2>{current.city}, {current.country}</h2>
          <div className="weather-info">
            <img src={current.icon} alt={current.condition} />
            <div>
              <p>{current.condition}</p>
              <p>Temp: {current.temp_c}°C</p>
              <p>Feels like: {current.feelslike_c}°C</p>
              <p>Humidity: {current.humidity}%</p>
              <p>Wind: {current.wind_kph} kph</p>
            </div>
          </div>
        </motion.div>
      )}

      {forecast.length > 0 && (
        <div className="forecast-chart">
          <h3>5-Day Forecast</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={forecast}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="avgtemp_c" stroke="#FF5733" strokeWidth={2} />
              <Line type="monotone" dataKey="maxtemp_c" stroke="#33C3FF" strokeWidth={2} />
              <Line type="monotone" dataKey="mintemp_c" stroke="#33FF7A" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default App;
